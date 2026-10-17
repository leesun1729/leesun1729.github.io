---
title: 'SCC'
date: 2024-01-20T21:55:56+08:00
tags: ['SCC', 'Tarjan']
category: 'algorithms'
summary: 'Introduces strongly connected components and condensation, with a Tarjan SCC template and example solutions'
draft: false
---

**Strongly Connected Component, SCC (Strongly Connect Component)**

# Definition

In a **directed graph**, take any two vertices `(u, v)`; if both `u -> v` and `v -> u` have a path, the graph is strongly connected.

**SCC (Strongly Connected Component)**: a maximal strongly connected subgraph.

**Condensation**: once we have found all the SCCs of a graph, we can contract each SCC into a single vertex. After condensation we get a new graph: we iterate over all **edges of the original graph** and add them to the new graph (remember to handle **self-loops**, and note that **duplicate edges** usually appear).

- The graph obtained after condensation is necessarily a **DAG (Directed Acyclic Graph)**.
- DAGs have many excellent properties: they admit **topological sorting**, and a topological order can be used for **DP**, and so on.

There are two algorithms for finding the strongly connected components of a directed graph: Tarjan's and Kosaraju's (both run in `O(V + E)`).

# Tarjan's algorithm for SCC of a directed graph

### Algorithm outline

Define the **DFS** tree as the spanning tree formed by starting from an arbitrary vertex and going downwards.

When we visit a direct neighbor `v` from `u`, if `v` has not been visited yet, then `(u, v)` is a **tree edge**. Otherwise `(u, v)` is a **non-tree edge**.

```cpp
struct SCC {
    int n;
    int cnt, cur;
    std::vector<std::vector<int> > e;
    std::stack<int> st;     // 用于 Tarjan 算法中保存被访问的节点
    std::vector<int> dfn, low, f, sz;

    SCC(int n) {
        cnt = 0;  // 用于计数目前发现的强连通分量个数
        cur = 0;  // 用作当前访问序号（dfn 的计数）
        this -> n = n;
        dfn.assign(n + 1, -1);  // 记录节点在 DFS 搜索中的访问顺序
        low.assign(n + 1, -1);  // 记录在 DFS 过程中每个节点可达的最小 dfn 值
        f.assign(n + 1, -1);   //  记录每个节点所属的强连通分量的编号
        sz.assign(n + 1, 0);   //  统计每个强连通分量中包含的节点数
        e.assign(n + 1, {});  // 用来存储图的邻接表
    }

    void add_edge(int u, int v) {
        e[u].push_back(v);
    }

    void dfs(int u) {
        dfn[u] = low[u] = ++cur;
        st.push(u);
        for(int v : e[u]) {
            if(f[v] != -1)  continue;
            if(dfn[v] == -1) {
                dfs(v);
            }
            low[u] = std::min(low[u], low[v]);
        }

        if(low[u] == dfn[u]) {
            cnt++;
            int x;
            do {
                x = st.top();
                st.pop();
                f[x] = cnt;
                sz[cnt]++;
            } while(x != u);
        }
    }

    std::vector<int> work() {
        for(int i = 1; i <= n; ++i) {
            if(f[i] == -1) {
                dfs(i);
            }
        }
        return f;
    }
};
```

**Example:** [LeetCode 1192. Critical Connections in a Network](https://leetcode.cn/problems/critical-connections-in-a-network/description/)

```cpp
class Solution {
public:
    int cur = 0;
    vector<int> dfn, low;
    vector<vector<int>> res;
    vector<vector<int>> adj;

    void tarjan(int u, int fa) {
        dfn[u] = low[u] = ++cur;
        for(int v : adj[u]) {
            if(v == fa) continue;
            if(!dfn[v]) {
                tarjan(v, u);
                low[u] = min(low[u], low[v]);
                if(dfn[u] < low[v]) {
                    res.push_back({u, v});
                }
            } else {
                low[u] = min(low[u], dfn[v]);
            }
        }
    }

    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
        dfn.resize(n);
        low.resize(n);
        adj.resize(n);
        for(auto &e : connections) {
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }

        for(int i = 0; i < n; ++i) {
            if(!dfn[i]) {
                tarjan(i, -1);
            }
        }

        return res;
    }
};
```

**Example: [Luogu P2341 [USACO03FALL][HAOI2006] Popular Cows G](https://www.luogu.com.cn/problem/P2341)**

```cpp
#include <bits/stdc++.h>

struct SCC {
    int n;
    int cnt, cur;
    std::vector<std::vector<int> > e;
    std::stack<int> st;     // 用于 Tarjan 算法中保存被访问的节点
    std::vector<int> dfn, low, f, sz;

    SCC(int n) {
        cnt = 0;  // 用于计数目前发现的强连通分量个数
        cur = 0;  // 用作当前访问序号（dfn 的计数）
        this -> n = n;
        dfn.assign(n + 1, -1);  // 记录节点在 DFS 搜索中的访问顺序
        low.assign(n + 1, -1);  // 记录在 DFS 过程中每个节点可达的最小 dfn 值
        f.assign(n + 1, -1);   //  记录每个节点所属的强连通分量的编号
        sz.assign(n + 1, 0);   //  统计每个强连通分量中包含的节点数
        e.assign(n + 1, {});  // 用来存储图的邻接表
    }

    void add_edge(int u, int v) {
        e[u].push_back(v);
    }

    void dfs(int u) {
        dfn[u] = low[u] = ++cur;
        st.push(u);
        for(int v : e[u]) {
            if(f[v] != -1)  continue;
            if(dfn[v] == -1) {
                dfs(v);
            }
            low[u] = std::min(low[u], low[v]);
        }

        if(low[u] == dfn[u]) {
            cnt++;
            int x;
            do {
                x = st.top();
                st.pop();
                f[x] = cnt;
                sz[cnt]++;
            } while(x != u);
        }
    }

    std::vector<int> work() {
        for(int i = 1; i <= n; ++i) {
            if(f[i] == -1) {
                dfs(i);
            }
        }
        return f;
    }
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);

    int n, m;
    std::cin >> n >> m;
    SCC g(n);
    std::vector<std::vector<int> > adj(n + 1);
    for(int i = 0; i < m; ++i) {
        int a, b;
        std::cin >> a >> b;
        adj[a].push_back(b);
        g.add_edge(a, b);
    }

    std::vector<int> f = g.work();
    std::vector<int> deg(n + 1);
    for(int i = 1; i <= n; ++i) {
        for(int v : adj[i]) {
            if(f[i] != f[v]) {
                deg[f[i]]++;
            }
        }
    }
    int ans = 0;
    for(int i = 1; i <= g.cnt; ++i) {
        if(!deg[i]) {
            if(ans) {
                std::cout << "0\n";
                return 0;
            }
            ans = i;
        }
    }
    std::cout << g.sz[ans] << '\n';
    return 0;
}
```

**Template problem:** [Luogu P2863 [USACO06JAN] The Cow Prom S](https://www.luogu.com.cn/problem/P2863)

```cpp
#include <bits/stdc++.h>

struct SCC {
    int n;
    int cnt, cur;
    std::vector<std::vector<int> > e;
    std::stack<int> st;     // 用于 Tarjan 算法中保存被访问的节点
    std::vector<int> dfn, low, f, sz, vis;

    SCC(int n) {
        cnt = 0;  // 用于计数目前发现的强连通分量个数
        cur = 0;  // 用作当前访问序号（dfn 的计数）
        this -> n = n;
        dfn.assign(n + 1, -1);  // 记录节点在 DFS 搜索中的访问顺序
        low.assign(n + 1, -1);  // 记录在 DFS 过程中每个节点可达的最小 dfn 值
        f.assign(n + 1, -1);   //  记录每个节点所属的强连通分量的编号
        sz.assign(n + 1, 0);   //  统计每个强连通分量中包含的节点数
        e.assign(n + 1, {});  // 用来存储图的邻接表
    }

    void add_edge(int u, int v) {
        e[u].push_back(v);
    }

    void dfs(int u) {
        dfn[u] = low[u] = ++cur;
        st.push(u);
        for(int v : e[u]) {
            if(f[v] != -1)  continue;
            if(dfn[v] == -1) {
                dfs(v);
            }
            low[u] = std::min(low[u], low[v]);
        }

        if(low[u] == dfn[u]) {
            cnt++;
            int x;
            do {
                x = st.top();
                st.pop();
                f[x] = cnt;
                sz[cnt]++;
            } while(x != u);
        }
    }

    void work() {
        for(int i = 1; i <= n; ++i) {
            if(f[i] == -1) {
                dfs(i);
            }
        }
    }
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);

    int n, m;
    std::cin >> n >> m;
    SCC g(n);
    std::vector<std::vector<int> > adj(n + 1);
    for(int i = 0; i < m; ++i) {
        int a, b;
        std::cin >> a >> b;
        adj[a].push_back(b);
        g.add_edge(a, b);
    }
    g.work();
    int ans = 0;
    for(int i = 1; i <= g.cnt; ++i) {
        if(g.sz[i] > 1)
            ans++;
    }

    std::cout << ans << '\n';
    return 0;
}
```
