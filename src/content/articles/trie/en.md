---
title: 'Trie'
date: 2024-01-20T22:08:54+08:00
tags: ['Trie']
category: 'algorithms'
summary: 'Explains the shared-prefix idea behind a trie and gives pointer and array templates'
draft: false
---

**A trie (dictionary tree, TrieTree)** is a kind of [tree structure](https://so.csdn.net/so/search?q=%E6%A0%91%E5%BD%A2%E7%BB%93%E6%9E%84&spm=1001.2101.3001.7020). Its typical use is counting, sorting and storing large numbers of strings (but not only strings — a 01 trie, for instance). The core idea is to exploit the **common prefix** of strings to save storage space. It makes good use of the shared prefixes between strings and thereby saves memory. A trie mainly supports two operations: **insert** and **search**.

**TrieNode form**

```cpp
struct Trie {
    Trie* son[26];
    bool isWord;
    Trie() {
        for(int i = 0; i < 26; ++i) {
            son[i] = nullptr;
        }
        isWord = false;
    }

    ~Trie() {
        for(int i = 0; i < 26; ++i) {
            if(son[i] != nullptr)   delete son[i];
        }
    }

    void insert(std::string s) {
        Trie* node = this;
        for(char c : s) {
            int x = c - 'a';
            if(node -> son[x] == nullptr) {
                node -> son[x] = new Trie();
            }
            node = node -> son[x];
        }
        node -> isWord = true;
    }

    bool search(std::string s) {
        Trie* node = this;
        for(char c : s) {
            int x = c - 'a';
            if(node -> son[x] == nullptr) {
                return false;
            }
            node = node -> son[x];
        }
        return node -> isWord;
    }

    bool startsWith(std::string prefix) {
        Trie* node = this;
        for(char c : prefix) {
            int x = c - 'a';
            if(node -> son[x] == nullptr) {
                return false;
            }
            node = node -> son[x];
        }
        return true;
    }
};
```

**Array form**

```cpp
const int maxn = 1e5 + 10;
bool vis[maxn];
int son[maxn][26], idx;
struct Trie {
    Trie() {
        memset(vis, false, sizeof vis);
        memset(son, 0, sizeof son);
        idx = 0;
    }

    void insert(std::string word) {
        int p = 0;
        for(char c : word) {
            int u = c - 'a';
            if(!son[p][u])  son[p][u] = ++idx;
            p = son[p][u];
        }
        vis[p] = true;
    }

    bool search(std::string word) {
        int p = 0;
        for(char c : word) {
            int u = c - 'a';
            if(!son[p][u]) {
                return false;
            }
            p = son[p][u];
        }
        return vis[p];
    }

    bool startsWith(std::string prefix) {
        int p = 0;
        for(char c : prefix) {
            int u = c - 'a';
            if(!son[p][u]) {
                return false;
            }
            p = son[p][u];
        }
        return true;
    }
};
```
