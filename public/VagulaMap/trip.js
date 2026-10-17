(() => {
  // --- 坐标系纠偏 (WGS-84 <-> GCJ-02) ---
  const PI = 3.1415926535897932384626;
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  function outOfChina(lng, lat) {
    return (lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271);
  }

  function transformlat(lng, lat) {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  function transformlng(lng, lat) {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
  }

  function wgs84togcj02(lng, lat) {
    if (outOfChina(lng, lat)) {
      return [lng, lat];
    }
    let dlat = transformlat(lng - 105.0, lat - 35.0);
    let dlng = transformlng(lng - 105.0, lat - 35.0);
    let radlat = lat / 180.0 * PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    let sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    let mglat = lat + dlat;
    let mglng = lng + dlng;
    return [mglng, mglat];
  }

  function gcj02towgs84(lng, lat) {
    if (outOfChina(lng, lat)) {
      return [lng, lat];
    }
    let dlat = transformlat(lng - 105.0, lat - 35.0);
    let dlng = transformlng(lng - 105.0, lat - 35.0);
    let radlat = lat / 180.0 * PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    let sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    let mglat = lat + dlat;
    let mglng = lng + dlng;
    return [lng * 2 - mglng, lat * 2 - mglat];
  }

  // 递归转换 GeoJSON coordinates 为 GCJ-02 格式（供高德地图多边形使用）
  function convertGeometryWgsToGcj(geom) {
    if (!geom) return null;
    const type = geom.type;
    const coords = geom.coordinates;
    let newCoords = coords;
    
    if (type === 'Point') {
      newCoords = wgs84togcj02(coords[0], coords[1]);
    } else if (type === 'LineString' || type === 'MultiPoint') {
      newCoords = coords.map(p => wgs84togcj02(p[0], p[1]));
    } else if (type === 'Polygon' || type === 'MultiLineString') {
      newCoords = coords.map(ring => ring.map(p => wgs84togcj02(p[0], p[1])));
    } else if (type === 'MultiPolygon') {
      newCoords = coords.map(poly => poly.map(ring => ring.map(p => wgs84togcj02(p[0], p[1]))));
    }
    
    return {
      type: type,
      coordinates: newCoords
    };
  }

  // 辅助函数：HTML 转义以防止 XSS
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 辅助函数：判断点是否在多边形内部 (Ray-casting 算法)
  function isPointInPolygon(point, polygonCoordinates) {
    const x = point[0];
    const y = point[1];
    let inside = false;
    
    const outerRing = polygonCoordinates[0];
    if (!outerRing) return false;
    
    for (let i = 0, j = outerRing.length - 1; i < outerRing.length; j = i++) {
      const xi = outerRing[i][0], yi = outerRing[i][1];
      const xj = outerRing[j][0], yj = outerRing[j][1];
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi + 0.000000000000001) + xi);
      if (intersect) inside = !inside;
    }
    
    if (!inside) return false;
    
    // 检查孔洞
    for (let k = 1; k < polygonCoordinates.length; k++) {
      const hole = polygonCoordinates[k];
      let inHole = false;
      for (let i = 0, j = hole.length - 1; i < hole.length; j = i++) {
        const xi = hole[i][0], yi = hole[i][1];
        const xj = hole[j][0], yj = hole[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi + 0.000000000000001) + xi);
        if (intersect) inHole = !inHole;
      }
      if (inHole) return false;
    }
    
    return true;
  }

  // 辅助函数：支持 Polygon 和 MultiPolygon
  function booleanPointInPolygon(pointGeoJSON, polygonGeoJSON) {
    const point = pointGeoJSON.geometry ? pointGeoJSON.geometry.coordinates : pointGeoJSON.coordinates;
    const geom = polygonGeoJSON.geometry || polygonGeoJSON;
    if (!point || !geom) return false;
    
    if (geom.type === "Polygon") {
      return isPointInPolygon(point, geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      for (const coords of geom.coordinates) {
        if (isPointInPolygon(point, coords)) {
          return true;
        }
      }
    }
    return false;
  }

  // 辅助函数：注入浮动弹窗必要样式
  function injectStyles() {
    if (document.getElementById("markerpro-style")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "markerpro-style";
    document.head.appendChild(styleEl);
  }

  // --- 动态资源加载器 ---
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadCss(url) {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }

  function loadAMap(key, securityJsCode) {
    window._AMapSecurityConfig = {
      securityJsCode: securityJsCode
    };
    return loadScript(`https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.ToolBar`);
  }


  // 共享的数据碰撞与高亮代码匹配逻辑
  function identifyVisitedRegions(donePoints, cities, countries) {
    const visitedCountryCodes = new Set();
    const visitedCityAdcodes = new Set();
    const chinaCities = cities ? cities.features : [];

    donePoints.forEach(point => {
      const geom = point.geometry;
      if (!geom) return;

      if (point.properties._cachedCountry) {
        if (point.properties._cachedCity) visitedCityAdcodes.add(point.properties._cachedCity);
        visitedCountryCodes.add(point.properties._cachedCountry);
        return;
      }

      // 无论底座是哪个，射线探测检测始终使用备份的原始 WGS-84 经纬度
      const wgsPoint = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: point.properties._wgsCoords || geom.coordinates
        }
      };

      let foundCity = false;
      if (chinaCities.length > 0) {
        for (const city of chinaCities) {
          try {
            if (booleanPointInPolygon(wgsPoint, city)) {
              const ad = city.properties.adcode;
              if (ad) {
                visitedCityAdcodes.add(Number(ad));
                point.properties._cachedCity = Number(ad);
              }
              visitedCountryCodes.add("CHN");
              point.properties._cachedCountry = "CHN";
              foundCity = true;
              break;
            }
          } catch (e) {}
        }
      }

      if (!foundCity) {
        for (const country of countries.features) {
          try {
              if (booleanPointInPolygon(wgsPoint, country)) {
              let code = country.properties["ISO3166-1-Alpha-3"] || country.properties.ISO_A3 || country.properties.iso_a3;
              if (!code || code === "-99" || code === -99) {
                code = country.properties.name;
              }
              if (code) {
                visitedCountryCodes.add(code);
                point.properties._cachedCountry = code;
              }
              break;
            }
          } catch (e) {}
        }
      }
    });

    return { visitedCountryCodes, visitedCityAdcodes };
  }

  // 共享的统计面板渲染逻辑
  function getStatsHtml(data, filterStatus, filterYear) {
    let counts = { done: 0, wish: 0, plan: 0 };
    let features = data && data.features ? data.features : [];
    if (filterYear !== "all") {
      features = features.filter(f => {
        let years = Array.isArray(f?.properties?.year) ? f.properties.year.map(String) : [];
        return years.includes(filterYear);
      });
    }
    for (let f of features) {
      let status = f?.properties?.status;
      if (status && counts.hasOwnProperty(status)) counts[status]++;
    }
    let total = counts.done + counts.wish + counts.plan;
    let filter = filterStatus;
    let makeStat = (name, key) => `<span class="${filter === key ? "active" : ""}" data-status="${key}">${name}<strong>${counts[key]}</strong></span>`;
    return `
      ${makeStat("已去", "done")}
      ${makeStat("想去", "wish")}
      ${makeStat("快去", "plan")}
      <span class="total ${filter === "all" ? "active" : ""}" data-status="all">总计<strong>${total}</strong></span>
    `;
  }

  function getYearStatsHtml(data, filterStatus, filterYear) {
    let yearMap = {};
    let totalCount = 0;
    let features = data && data.features ? data.features : [];
    if (filterStatus !== "all") features = features.filter(f => f.properties.status === filterStatus);
    for (let f of features) {
      let years = Array.isArray(f?.properties?.year) ? f.properties.year : [];
      if (!years.length) {
        yearMap["未知"] = (yearMap["未知"] || 0) + 1;
        totalCount++;
      } else {
        for (let y of years) {
          let yStr = y && String(y).trim() ? String(y) : "未知";
          yearMap[yStr] = (yearMap[yStr] || 0) + 1;
          totalCount++;
        }
      }
    }

    let currentYear = filterYear;
    let triggerLabel = currentYear === "all" ? "全部年份" : currentYear;
    
    return `
      <div class="y-trigger">
        <span>${triggerLabel}</span>
        <i class="y-arrow"></i>
      </div>
      <div class="y-menu">
        <div class="y-grid">
          <div class="y-item ${currentYear === "all" ? "active" : ""}" data-year="all">
            <em>ALL</em>
            <strong>${totalCount}</strong>
          </div>
          ${Object.keys(yearMap).sort((a, b) => {
            if (a === "未知") return 1;
            if (b === "未知") return -1;
            return parseInt(b, 10) - parseInt(a, 10);
          }).map(y => `
            <div class="y-item ${currentYear === y ? "active" : ""}" data-year="${y}">
              <em>${y}</em>
              <strong>${yearMap[y]}</strong>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // ==========================================
  // --- 引擎一：高德地图 AMap 渲染实现类 ---
  // ==========================================
  class AmapTravelMap {
    constructor(options) {
      options = options || {};
      this.data = options.data;
      this.countries = options.countries;
      this.cities = options.cities;
      this.clusterData = [];
      this.markers = [];
      this.highlightPolygons = [];
      this.filterStatus = "all";
      this.filterYear = "all";
      this.currentFeatures = [];
      this.statsEl = null;
      this.yearStatsEl = null;
      this.infoWindow = null;
      this._create();
    }

    geojsonExtent(geojson) {
      if (!geojson || !geojson.features || !geojson.features.length) {
        let mapCenter = MARKER_PRO.center;
        if (MARKER_PRO.coordinateSystem === "WGS84") {
          mapCenter = wgs84togcj02(mapCenter[0], mapCenter[1]);
        }
        return [mapCenter, mapCenter];
      }
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      for (let feature of geojson.features) {
        if (!feature || !feature.geometry) continue;
        if (feature.geometry.type === "Point") {
          let [lng, lat] = feature.geometry.coordinates || [];
          if (typeof lng === "number" && typeof lat === "number") {
            if (lng < minLng) minLng = lng;
            if (lat < minLat) minLat = lat;
            if (lng > maxLng) maxLng = lng;
            if (lat > maxLat) maxLat = lat;
          }
        }
      }
      return minLng === Infinity ? [MARKER_PRO.center, MARKER_PRO.center] : [[minLng, minLat], [maxLng, maxLat]];
    }

    fitToMarkers() {
      if (!this.currentFeatures || this.currentFeatures.length === 0) return;
      let coords = this.currentFeatures
        .map(f => f.geometry.coordinates)
        .filter(Boolean);

      if (coords.length === 1) {
        this.map.setZoomAndCenter(Math.max(this.map.getZoom(), 8), coords[0]);
      } else if (coords.length > 1) {
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        for (let coord of coords) {
          if (coord[0] < minLng) minLng = coord[0];
          if (coord[1] < minLat) minLat = coord[1];
          if (coord[0] > maxLng) maxLng = coord[0];
          if (coord[1] > maxLat) maxLat = coord[1];
        }
        let bounds = new AMap.Bounds([minLng, minLat], [maxLng, maxLat]);
        this.map.setBounds(bounds);
      }
    }

    _create() {
      injectStyles();
      
      const getTheme = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const queryTheme = urlParams.get('theme');
        if (queryTheme === 'dark' || queryTheme === 'light') return queryTheme;
        if (window.self !== window.top) {
          try {
            const parentTheme = window.parent.document.documentElement.getAttribute('data-theme');
            if (parentTheme === 'dark' || parentTheme === 'light') return parentTheme;
          } catch (e) {}
        }
        const localTheme = document.documentElement.getAttribute('data-theme');
        if (localTheme === 'dark' || localTheme === 'light') return localTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };

      const getStyleUrl = () => {
        const theme = getTheme();
        if (theme === 'dark') {
          return (typeof MARKER_PRO !== "undefined" && MARKER_PRO.styleDark) || 'amap://styles/dark';
        } else {
          return (typeof MARKER_PRO !== "undefined" && MARKER_PRO.styleLight) || 'amap://styles/normal';
        }
      };

      let mapCenter = MARKER_PRO.center;
      if (MARKER_PRO.coordinateSystem === "WGS84") {
        mapCenter = wgs84togcj02(mapCenter[0], mapCenter[1]);
      }

      const map = new AMap.Map("trip", {
        zoom: parseFloat(MARKER_PRO.zoom),
        center: mapCenter,
        zooms: [parseFloat(MARKER_PRO.minZoom), parseFloat(MARKER_PRO.maxZoom)],
        mapStyle: getStyleUrl(),
        isHotspot: false
      });

      map.addControl(new AMap.ToolBar({
        position: { top: '10px', right: '10px' }
      }));

      // AMap 自定义返回中心控制按钮
      const backHomeContainer = document.createElement("div");
      backHomeContainer.className = "amap-custom-ctrl mapboxgl-ctrl-group mapboxgl-ctrl";
      backHomeContainer.style.position = "absolute";
      backHomeContainer.style.top = "90px";
      backHomeContainer.style.right = "10px";
      backHomeContainer.style.zIndex = "100";
      
      const backHomeBtnEl = document.createElement("button");
      backHomeBtnEl.className = "mapboxgl-ctrl-icon mapbox-gl-back";
      backHomeBtnEl.type = "button";
      backHomeBtnEl.title = "返回中心";
      backHomeBtnEl.style.width = "30px";
      backHomeBtnEl.style.height = "30px";
      backHomeBtnEl.style.border = "none";
      backHomeBtnEl.style.backgroundSize = "16px";
      backHomeBtnEl.style.backgroundPosition = "center";
      backHomeBtnEl.style.backgroundRepeat = "no-repeat";
      backHomeBtnEl.style.cursor = "pointer";
      backHomeBtnEl.style.backgroundColor = "transparent";
      backHomeBtnEl.innerHTML = '<span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Back Home" style="display:block;width:100%;height:100%;"></span>';
      
      backHomeBtnEl.onclick = () => {
        map.setZoomAndCenter(parseFloat(MARKER_PRO.zoom), mapCenter);
      };
      
      backHomeContainer.appendChild(backHomeBtnEl);
      document.getElementById("trip").appendChild(backHomeContainer);

      this.map = map;

      // 信息窗口委派监听
      document.getElementById("trip").addEventListener("click", e => {
        const closeBtn = e.target.closest(".mp-close");
        if (closeBtn && this.infoWindow) {
          e.preventDefault();
          this.infoWindow.close();
        }
      });

      this.addCustomLayers();

      // 构建统计面板与事件
      this.statsEl = document.createElement("div");
      this.statsEl.className = "markerpro-stats";
      document.getElementById("trip").appendChild(this.statsEl);
      this.statsEl.addEventListener("click", e => {
        const target = e.target.closest("[data-status]");
        if (target) {
          const status = target.getAttribute("data-status");
          this.filterStatus = status;
          if (status === "all") this.filterYear = "all";
          this.updateMarkers();
          this.fitToMarkers();
        }
      });
      this.updateStatsPanel();

      this.yearStatsEl = document.createElement("div");
      this.yearStatsEl.className = "markerpro-year-stats";
      document.getElementById("trip").appendChild(this.yearStatsEl);
      this.yearStatsEl.addEventListener("click", e => {
        const trigger = e.target.closest(".y-trigger");
        if (trigger) {
          this.isYearMenuOpen = !this.isYearMenuOpen;
          this.yearStatsEl.classList.toggle("is-open", this.isYearMenuOpen);
          return;
        }
        const target = e.target.closest("[data-year]");
        if (target) {
          const year = target.getAttribute("data-year");
          this.filterYear = (this.filterYear === year) ? "all" : year; 
          this.updateMarkers();
          this.fitToMarkers();
          this.updateYearStatsPanel();
          this.isYearMenuOpen = false;
          this.yearStatsEl.classList.remove("is-open");
        }
      });
      this.isYearMenuOpen = false;
      this.updateYearStatsPanel();

      // 主题动态响应
      const handleThemeChange = () => {
        const targetStyle = getStyleUrl();
        map.setMapStyle(targetStyle);
      };
      const localObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'data-theme') handleThemeChange();
        });
      });
      localObserver.observe(document.documentElement, { attributes: true });

      if (window.self !== window.top) {
        try {
          const parentObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (mutation.attributeName === 'data-theme') handleThemeChange();
            });
          });
          parentObserver.observe(window.parent.document.documentElement, { attributes: true });
        } catch (e) {}
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);

      map.on("complete", () => {
        if (this.data) {
          this.cluster.load(this.data.features);
          this.clusterData = {
            type: "FeatureCollection",
            features: this.cluster.getClusters([-180, -90, 180, 90], parseFloat(MARKER_PRO.zoom))
          };
          this.updateMarkers(true);
          this.updateHighlights();
        }
        document.querySelector("#trip").classList.add("is-loaded");
      });

      map.on("zoomend", () => {
        if (!this.currentFeatures || this.currentFeatures.length === 0) return;
        try {
          let currentZoom = Math.floor(map.getZoom());
          if (this._lastZoom === currentZoom) return;
          this._lastZoom = currentZoom;
          this.clusterData = {
            type: "FeatureCollection",
            features: this.cluster.getClusters([-180, -90, 180, 90], currentZoom)
          };
          this.updateMarkers(true);
        } catch (err) { console.warn("Supercluster 缩放更新跳过:", err); }
      });

      this.cluster = new Supercluster({ 
        radius: 26, 
        maxZoom: 14,
        map: (props) => {
          const stats = { done: 0, plan: 0, wish: 0 };
          if (props.status && stats.hasOwnProperty(props.status)) {
            stats[props.status] = 1;
          } else {
            stats.done = 1;
          }
          return stats;
        },
        reduce: (accumulated, props) => {
          accumulated.done += props.done;
          accumulated.plan += props.plan;
          accumulated.wish += props.wish;
        }
      });
    }

    addCustomLayers() {
      // AMap has built-in national boundaries, no manual overlays needed
    }

    updateHighlights() {
      if (!this.map || !this.countries || !this.data) return;

      let features = this.data.features;
      if (this.filterStatus !== "all") {
        features = features.filter(f => f.properties.status === this.filterStatus);
      }
      if (this.filterYear !== "all") {
        features = features.filter(f => {
          let years = Array.isArray(f?.properties?.year) ? f.properties.year.map(String) : [];
          return years.includes(this.filterYear);
        });
      }
      const donePoints = features.filter(f => f.properties.status === "done");

      const { visitedCountryCodes, visitedCityAdcodes } = identifyVisitedRegions(donePoints, this.cities, this.countries);

      const finalCodes = Array.from(visitedCountryCodes);
      const hasChina = finalCodes.includes("CHN");
      const foreignCodes = finalCodes.filter(c => c !== "CHN");
      const finalCityCodes = Array.from(visitedCityAdcodes);

      this.highlightPolygons.forEach(polygon => polygon.setMap(null));
      this.highlightPolygons = [];

      const isWhole = typeof MARKER_PRO !== "undefined" && MARKER_PRO.lightUpChinaWhole === true;

      const idProp = this.countries.features[0].properties["ISO3166-1-Alpha-3"] ? "ISO3166-1-Alpha-3" : "ISO_A3";
      
      this.countries.features.forEach(country => {
        let code = country.properties[idProp];
        if (!code || code === "-99" || code === -99) {
          code = country.properties.name;
        }
        if (code === "CHN" && hasChina && isWhole) {
          this.drawCountryPolygon(country, "#FFB347", true); 
        } else if (foreignCodes.includes(code)) {
          this.drawCountryPolygon(country, "#E68A8A", true);
        }
      });

      if (!isWhole && this.cities && finalCityCodes.length > 0) {
        this.cities.features.forEach(city => {
          const ad = Number(city.properties.adcode);
          if (finalCityCodes.includes(ad)) {
            this.drawCityPolygon(city, "#FFB347");
          }
        });
      }
    }

    drawCountryPolygon(feature, color, fillEnabled) {
      const gcjGeometry = convertGeometryWgsToGcj(feature.geometry);
      if (!gcjGeometry) return;

      const drawSingle = (coords) => {
        const polygon = new AMap.Polygon({
          path: coords,
          fillColor: color,
          fillOpacity: fillEnabled ? 0.20 : 0,
          strokeColor: 'transparent',
          strokeOpacity: 0,
          strokeWeight: 0
        });
        polygon.setMap(this.map);
        this.highlightPolygons.push(polygon);
      };

      if (gcjGeometry.type === 'Polygon') {
        drawSingle(gcjGeometry.coordinates);
      } else if (gcjGeometry.type === 'MultiPolygon') {
        gcjGeometry.coordinates.forEach(polyCoords => drawSingle(polyCoords));
      }
    }

    drawCityPolygon(feature, color) {
      const gcjGeometry = convertGeometryWgsToGcj(feature.geometry);
      if (!gcjGeometry) return;

      const drawSingle = (coords) => {
        const glowPolygon = new AMap.Polygon({
          path: coords,
          fillColor: 'transparent',
          strokeColor: color,
          strokeOpacity: 0.2,
          strokeWeight: 4
        });
        glowPolygon.setMap(this.map);
        this.highlightPolygons.push(glowPolygon);

        const polygon = new AMap.Polygon({
          path: coords,
          fillColor: color,
          fillOpacity: 0.25,
          strokeColor: color,
          strokeOpacity: 0.4,
          strokeWeight: 1.2
        });
        polygon.setMap(this.map);
        this.highlightPolygons.push(polygon);
      };

      if (gcjGeometry.type === 'Polygon') {
        drawSingle(gcjGeometry.coordinates);
      } else if (gcjGeometry.type === 'MultiPolygon') {
        gcjGeometry.coordinates.forEach(polyCoords => drawSingle(polyCoords));
      }
    }

    updateStatsPanel() {
      if (this.statsEl) {
        this.statsEl.innerHTML = getStatsHtml(this.data, this.filterStatus, this.filterYear);
      }
    }

    updateYearStatsPanel() {
      if (this.yearStatsEl) {
        this.yearStatsEl.innerHTML = getYearStatsHtml(this.data, this.filterStatus, this.filterYear);
        this.yearStatsEl.classList.toggle("is-open", this.isYearMenuOpen);
      }
    }

    updateMarkers(isZoomOnly = false) {
      let filtered = this.data.features;
      if (this.filterStatus !== "all") filtered = filtered.filter(f => f.properties.status === this.filterStatus);
      if (this.filterYear !== "all") {
        filtered = filtered.filter(f => {
          let years = Array.isArray(f?.properties?.year) ? f.properties.year.map(String) : [];
          return years.includes(this.filterYear);
        });
      }

      if (!isZoomOnly) this.updateHighlights();

      if (!filtered || filtered.length === 0) {
        try { this.cluster.load([]); } catch {}
        this.clusterData = { type: "FeatureCollection", features: [] };
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
        
        let mapCenter = MARKER_PRO.center;
        if (MARKER_PRO.coordinateSystem === "WGS84") {
          mapCenter = wgs84togcj02(mapCenter[0], mapCenter[1]);
        }
        this.map.setZoomAndCenter(parseFloat(MARKER_PRO.zoom), mapCenter);
        this.currentFeatures = [];
        this.updateStatsPanel();
        this.updateYearStatsPanel();
        return;
      }
      this.currentFeatures = filtered;
      try { this.cluster.load(filtered); } catch (err) { return; }
      let currentZoom = Math.floor(this.map.getZoom());
      try { this.clusterData = { type: "FeatureCollection", features: this.cluster.getClusters([-180, -90, 180, 90], currentZoom) }; } catch (err) { return; }
      
      this.markers.forEach(m => m.setMap(null));
      this.markers = [];

      for (let feature of this.clusterData.features) {
        if (feature.properties.cluster) this.addClusterMarker(feature);
        else this.addPhotoMarker(feature);
      }
      if (!isZoomOnly) this.fitToMarkers();
      this.updateStatsPanel();
      this.updateYearStatsPanel();
    }

    createMarker() { return document.createElement("div"); }

    addPhotoMarker(feature) {
      let el = this.createMarker();
      el.className = "marker";
      el.classList.add(`marker--${feature.properties.status || "done"}`);
      let coverHtml = "";
      if (feature.properties.image && feature.properties.image.length > 0) {
        const imageUrl = escapeHtml(feature.properties.image[0]);
        const imageAlt = escapeHtml(feature.properties.title || "Image");
        el.style.setProperty("--photo", `url("${imageUrl}")`);
        coverHtml = `<img src="${imageUrl}" alt="${imageAlt}" class="markerPro--cover" />`;
        el.classList.add("has-photo");
      } else el.classList.add("no-hover");

      const p = feature.properties;
      let displayTitle = p.title || "未命名";
      if (p.region && p.spot) {
        displayTitle = `${p.spot} · ${p.region}`;
      } else if (p.region || p.spot) {
        displayTitle = p.spot || p.region;
      }

      let popupHtml = `<div class="markerPro--header">${coverHtml}<span class="markerPro--name">${escapeHtml(displayTitle)}</span></div><div class="markerPro--content">`;
      if (feature.properties.posts && feature.properties.posts.length > 0) {
        popupHtml += feature.properties.posts.map(post => `<div class="markerPro--link"><a target="_blank" href="${escapeHtml(post.permalink)}">${escapeHtml(post.title)}</a></div>`).join("");
      } else if (feature.properties.status === "plan") {
        popupHtml += `<div class="markerPro--note">计划日期：${escapeHtml(feature.properties.plan_date || "未定")}</div>`;
      } else if (feature.properties.status === "wish") {
        popupHtml += `<div class="markerPro--note">想去理由：${escapeHtml(feature.properties.wish_reason || "无")}</div>`;
      } else { el.classList.add("no-post"); popupHtml += "<div>该地点暂无游记。</div>"; }
      if (feature.properties.year && feature.properties.year.length > 0) {
        popupHtml += '<div class="markerPro--years">' + feature.properties.year.map(y => `<span class="markerpro-year">${escapeHtml(y)}</span>`).join(" ") + '</div>';
      }
      popupHtml += "</div>";
      this.addMarkerToMap(el, feature.geometry.coordinates, popupHtml);
    }

    addClusterMarker(clusterFeature) {
      let el = this.createMarker();
      const p = clusterFeature.properties;
      let dominantStatus = "done";
      
      if (p.done > 0) {
        dominantStatus = "done";
      } else if (p.plan > 0) {
        dominantStatus = "plan";
      } else if (p.wish > 0) {
        dominantStatus = "wish";
      }

      el.className = `marker cluster cluster--${dominantStatus}`;
      el.dataset.cardinality = Math.min(MARKER_PRO.limit, clusterFeature.properties.point_count);
      
      let marker = new AMap.Marker({
        content: el,
        position: clusterFeature.geometry.coordinates,
        anchor: 'center'
      });
      marker.setMap(this.map);
      marker.on('click', () => this.clusterDidClick(clusterFeature));
      this.markers.push(marker);
    }

    addMarkerToMap(el, coords, html) {
      let marker = new AMap.Marker({
        content: el,
        position: coords,
        anchor: 'center'
      });
      marker.setMap(this.map);
      this.markers.push(marker);

      const infoWindowContent = `
        <div class="mapboxgl-popup mapboxgl-popup-anchor-bottom" style="position: relative; transform: none; max-width: none; width: 280px; pointer-events: auto;">
          <div class="mapboxgl-popup-content">
            <button type="button" class="mp-close" aria-label="Close">×</button>
            ${html}
          </div>
          <div class="mapboxgl-popup-tip" style="border-top-color: var(--bg-card);"></div>
        </div>
      `;

      marker.on('click', () => {
        if (this.infoWindow) this.infoWindow.close();
        this.infoWindow = new AMap.InfoWindow({
          isCustom: true,
          content: infoWindowContent,
          offset: new AMap.Pixel(0, -15)
        });
        this.infoWindow.open(this.map, coords);
      });

      return marker;
    }

    clusterDidClick(clusterFeature) {
      let leaves = { type: "FeatureCollection", features: this.cluster.getLeaves(clusterFeature.properties.cluster_id) };
      let coords = leaves.features.map(f => f.geometry.coordinates);
      
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      for (let coord of coords) {
        if (coord[0] < minLng) minLng = coord[0];
        if (coord[1] < minLat) minLat = coord[1];
        if (coord[0] > maxLng) maxLng = coord[0];
        if (coord[1] > maxLat) maxLat = coord[1];
      }
      let bounds = new AMap.Bounds([minLng, minLat], [maxLng, maxLat]);
      this.map.setBounds(bounds);
    }
  }

  // --- 初始化流程：根据所选底座动态加载并运行 ---
  if (document.querySelector("#trip") != null) {
    const fetchJson = url => fetch(url).then(res => res.ok ? res.json() : null).catch(() => null);
    
    // 初始化时开始获取公共数据源
    const dataPromises = [
      fetchJson("markers.json"),
      fetchJson("countries_wdd.json"),
      fetchJson("china-cities_wdd.json")
    ];

    // 动态加载高德地图
    const key = MARKER_PRO.key || "";
    const securityJsCode = MARKER_PRO.securityJsCode || "";
    dataPromises.push(loadAMap(key, securityJsCode));

    Promise.all(dataPromises).then(([markersData, countriesData, citiesData]) => {
      if (!markersData) {
        console.error("加载 markers.json 失败");
        return;
      }

      // 预处理点位数据并处理坐标系偏移
      if (markersData.features) {
        markersData.features.forEach(feat => {
          if (feat && feat.properties) {
            feat.properties.posts = Array.isArray(feat.properties.posts) ? feat.properties.posts : [];
            feat.properties.year = Array.isArray(feat.properties.year) ? feat.properties.year.map(String) : [];
          }
          if (feat && feat.geometry && feat.geometry.type === 'Point') {
            const rawCoords = feat.geometry.coordinates;
            // 备份 WGS-84 和 GCJ-02 两套坐标以应对不同底座
            if (MARKER_PRO.coordinateSystem === 'GCJ02') {
              feat.properties._wgsCoords = gcj02towgs84(rawCoords[0], rawCoords[1]);
              feat.properties._gcjCoords = rawCoords;
            } else {
              feat.properties._wgsCoords = rawCoords;
              feat.properties._gcjCoords = wgs84togcj02(rawCoords[0], rawCoords[1]);
            }
            
            // 指定 Supercluster 与渲染所用的主要坐标集 (使用纠偏后的 GCJ-02 坐标)
            feat.geometry.coordinates = feat.properties._gcjCoords;
          }
        });
      }

      // 实例化高德地图管理器
      new AmapTravelMap({ data: markersData, countries: countriesData, cities: citiesData });
    }).catch(err => {
      console.error("VagulaMap 引擎初始化失败:", err);
    });
  }
})();