# 🌏 VagulaMap - 极简通用的个人旅行足迹地图 (Travel Footprint Map for Hexo/Hugo/WordPress Blogs)

VagulaMap 是一款 **100% 独立于前端框架、开箱即用** 的个人旅行足迹地图组件，支持全球国家与国内省市版图的自动点亮。不依赖任何特定博客框架或后端环境。您可以直接将其作为一个静态资源文件夹放入您的站点，然后通过 `<iframe>` 极其简单地嵌入到任何页面或文章中。

非常适合 **Hexo、Hugo、Jekyll、Astro 等静态博客**，也完美支持 **WordPress、Typecho、Ghost、Halo 等动态博客系统** 作为个人游记地图或旅行足迹打点插件使用。

---

## ✨ 项目亮点 & 特色功能

- **零框架依赖，开箱即用**：采用标准的纯 HTML、JS 和 CSS 构建，无需任何打包或编译开发环境。
- **世界与国内版图点亮**：支持根据经纬度足迹，自动匹配并点亮去过的世界国家，以及国内细分的省份/城市区域。同时，支持在代码配置中一键切换“中国边界实线/虚线样式”以及“点亮中国整体 / 点亮细分省市”两种显示模式。
- **高能碰撞缓存优化 (Performance Boost)**：针对射线碰撞判定（Ray-casting）进行了性能调优，为点位与地理边界的检测结果引入了本地缓存机制（`_cachedCountry` / `_cachedCity`）。只在数据首次加载时运行碰撞判定，后续二次过滤和缩放重绘时直接读取缓存，极大地降低了 CPU 运算开销。
- **Supercluster 聚合打点**：集成高性能聚合算法，在大数据量或点位密集时自动收拢，并支持平滑过渡缩放，最大程度保持全国和全球宏观视野下的流畅交互。
- **Iframe 主题同步 (Theme Sync)**：专为 Iframe 嵌入设计。子页面能自动感知并跟随父页面的主题样式（亮色/暗色模式），亦支持通过 URL 参数（`?theme=dark`）或系统自身偏好进行智能切换。
- **交互式年份与分类统计**：内置悬浮磨砂玻璃统计卡片，支持按年份、足迹分类状态（“已去”、“想去”、“快去”）进行动态组合过滤筛选。
- **大头针光晕动画**：为不同状态的打点提供专属色调及呼吸光晕微交互，极具现代美感。

---

## 📂 文件结构

VagulaMap 是一个自包含的独立目录，结构如下：

```text
vagulamap/
├── index.html            # 独立入口页面，包含 DOM 结构与全局配置
├── trip.js               # 核心地图渲染与交互控制脚本
├── trip.css              # 地图样式与卡片样式的样式表
├── markers.json          # 您的足迹打点数据源 (GeoJSON 格式)
├── china-cities_wdd.json # 本地化中国市级边界 GeoJSON 数据
├── countries_wdd.json    # 本地化全球国家边界 GeoJSON 数据
└── supercluster.min.js   # 聚合打点依赖库
```

---

## ⚙️ 部署与使用步骤

### 第一步：配置高德地图 API Key 与安全密钥

高德地图需要有效的 Key 和安全密钥（JS Code）才能正常渲染底图。
1. 注册并登录 [高德开放平台](https://lbs.amap.com/)，创建 Web 端 (JS API) 应用以获取您的 Key 与安全密钥。
2. 打开 `index.html`，在全局变量 `MARKER_PRO` 中配置您的 Key、安全密钥与自定义开关：

```javascript
  var MARKER_PRO = {
    zoom: isMobile ? "4.0" : "2.0", // 初始缩放比例
    maxZoom: "14",
    minZoom: "2",
    limit: "9",
    // 默认地图中心点
    center: isMobile ? [117.05, 30.52] : [105, 35], 
    
    // 💡 高德地图配置
    key: "您的高德地图 Key",
    securityJsCode: "您的高德地图安全密钥",
    
    // 💡 坐标系配置：支持 "WGS84"（标准GPS，markers.json 默认）或 "GCJ02"（高德/火星坐标）
    // 如果设置为 "WGS84"，高德地图底座会自动在前端进行纠偏转换，无需手动修改 markers.json 里的经纬度
    coordinateSystem: "WGS84",
    
    // 💡 核心显示开关
    showChinaBorderDashed: true, // 中国边界虚线开关：true 为虚线，false 为实线
    lightUpChinaWhole: false     // 点亮中国整体开关：true 为点亮整体，false 为单独点亮省份城市
  };
```

---

### 第二步：将整个目录上传/放入博客目录

#### 1. 静态博客 (Hexo, Hugo, Astro, Jekyll 等)
将 `vagulamap/` 文件夹放到对应的静态资源目录下：
- **Hexo**：放入 `source/` 目录中。
- **Hugo**：放入 `static/` 目录中。
- **Astro**：放入 `public/` 目录中。
- 最终可通过 `https://您的域名/vagulamap/index.html` 访问。

#### 2. 动态博客 (WordPress, Typecho, Ghost, Halo 等)
- **方案一（本地上传）**：使用 FTP 或服务器面板，将整个 `vagulamap` 目录上传至您网站服务器的根目录下（例如命名为 `/trip/` 目录），通过 `https://您的域名/trip/index.html` 访问。
- **方案二（独立静态托管）**：将本项目部署至 **Vercel**、**Netlify** 或 **Cloudflare Pages** 等免费平台，不占用您自己服务器的带宽和流量。

---

### 第三步：在页面或文章中以 Iframe 引入

在您的博客页面、Markdown 文章或自定义 HTML 中插入如下 `iframe` 代码即可完成嵌入：

```html
<iframe 
  src="/vagulamap/index.html" 
  style="width: 100%; height: 600px; border: none; border-radius: 12px; overflow: hidden;"
  allowfullscreen>
</iframe>
```

> [!TIP]
> **自动主题跟随说明**：
> 默认情况下，若父页面切换暗黑模式（如给 `<html>` 标签设置 `data-theme="dark"`），VagulaMap 会自动重新载入暗色底图。
> 您也可以直接在 `src` 后拼接参数进行强制设定：
> - 亮色模式：`/vagulamap/index.html?theme=light`
> - 暗色模式：`/vagulamap/index.html?theme=dark`

---

## 🗺️ 标点数据格式说明 `markers.json`

编辑 `markers.json` 即可管理您的旅行足迹。数据采用标准的 GeoJSON 格式，示例如下：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "title": "中山陵 · 南京",
        "region": "南京",
        "spot": "中山陵",
        "status": "done",
        "year": ["2024"],
        "image": ["https://images.unsplash.com/photo-1627918803730-ee02947118ca?w=800"],
        "posts": [
          {
            "title": "金陵寻古：中山陵一日游",
            "permalink": "https://wangdaodao.me/2026/nanjing-trip/"
          }
        ]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [118.8485, 32.0620]
      }
    }
  ]
}
```

### 属性字段说明：
- `title`：打点景区的显示标题，例如 `"中山陵 · 南京"`。
- `region`：打点所在的市级行政区。用于匹配中国地图以高亮显示去过的省份/城市（必须与地理数据名称匹配，如 `"南京"`, `"北京"`）。
- `spot`：景区名称。
- `status`：分类状态，只支持三个值：
  - `done`：已去（亮橙色大头针，触发对应区域高亮）
  - `wish`：想去（紫色大头针，不触发区域高亮）
  - `plan`：快去（绿色大头针，不触发区域高亮）
- `year`：数组，包含该打点的关联年份列表（如 `["2024", "2025"]`），用于年份筛选。
- `image`：数组，封面图链接。当鼠标悬停大头针时，它会在悬浮卡片中作为封面图展示。
- `posts`：数组，与该点位相关的文章链接。每个元素包含 `title` (文章标题) 与 `permalink` (文章网址)。
- `wish_reason`：(可选) 想去的理由（用于 `status: "wish"` 的标记）。
- `plan_date`：(可选) 计划时间（用于 `status: "plan"` 的标记）。
- `geometry.coordinates`：打点的经纬度坐标，格式为 `[经度, 纬度]`。

---


## 🔗 演示与反馈

- **🌏 线上演示页面**: [https://wangdaodao.me/trip/](https://wangdaodao.me/trip/)
- **💬 博客交流**: [王导导的博客](https://wangdaodao.me/vagulamap/)

---

## 📄 开源协议

本项目采用 **MIT** 开源许可证。您可以自由地在个人博客或商业项目中使用、修改并重新分发此代码，**但使用时请务必注明版权与出处：[王导导 博客](https://wangdaodao.me/vagulamap/)**。
