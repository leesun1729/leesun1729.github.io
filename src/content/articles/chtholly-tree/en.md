---
title: 'Chtholly Tree'
date: 2024-01-20T21:59:08+08:00
tags: ['珂朵莉树', '线段树']
category: 'algorithms'
summary: 'Implements range add, range assign, range k-th smallest and range power-sum queries with a Chtholly tree'
draft: false
---

Problem link: [CF896C Willem, Chtholly and Seniorious](https://codeforces.com/problemset/problem/896/C)

The problem asks us to maintain a data structure supporting the following operations:

```plaintext
Add x to every number in the interval [l, r]
Assign x to every number in the interval [l, r]
Find the k-th smallest number in the interval [l, r]
Compute the sum of the x-th powers of all numbers in the interval [l, r], modulo y
```

This data structure can be used when the operations are interval assignment (interval flattening) and the data is random.

**[Click to learn more](https://blog.csdn.net/qq_50332374/article/details/119722580?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522169830796616800211522669%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=169830796616800211522669&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-119722580-null-null.142%5Ev96%5Epc_search_result_base1&utm_term=%E7%8F%82%E6%9C%B5%E8%8E%89%E6%A0%91&spm=1018.2226.3001.4187)**

**Concrete implementation**: define each interval `[l, r]` whose values all equal `v` as one node. Here `v` must be declared `mutable`, because when a `node` object is put into a `std::set`, such objects are treated as `const` inside the `std::set`, so the members of a struct object stored in a `std::set` cannot be modified — any operation that changes an element could affect the ordering property of the set and would violate the internal mechanics of `std::set`. But here all we need to modify is the value `v` on the interval `[l, r]`, while the ordering is determined by the left endpoint of each node's interval. Declaring `v` as `mutable` therefore makes it convenient to modify the interval values later.

```cpp
typedef long long ll;
struct node {
    ll l, r;
    mutable ll v; // 允许v始终修改
    node(ll l, ll r, ll v) : l(l), r(r), v(v) {}
    friend bool operator < (node x, node y) {
        return x.l < y.l;
    }
};
```

**C++ syntax**: here the operator is overloaded inside the struct, redefining the sort order that the later `std::set` uses, so that nodes are sorted by the left endpoint of their interval.

**Interval splitting**: adding a node cannot guarantee that both endpoints of an interval land exactly on node boundaries, so nodes have to be split. Using the ordering of the `std::set`, find the first node whose left endpoint is greater than or equal to the given position `pos`; only two cases need to be considered:

`condition1 :` `pos` is exactly the left endpoint of a node — return it directly.

`condition2 :` `pos` is smaller than the left endpoint of the current node, so `pos` must lie inside the interval of the node before it; split that node's interval `[l, r]` into `[l, pos - 1]` and `[pos, r]`.

```cpp
std::set<node> tree;

// 区间划分
std::set<node> ::iterator split(ll pos) {
    auto it = tree.lower_bound(node(pos, 0, 0));
    if(it != tree.end() && it -> l == pos) {
        return it;
    }
    it--;
    ll l = it -> l, r = it -> r, v = it -> v;
    tree.erase(it);
    tree.insert(node(l, pos - 1, v));
    return tree.insert(node(pos, r, v)).first;
}
```

**C++ syntax**: `[insert code snippet here]` — `tree.insert().first` is a return value of `std::set`. When you insert a value into a `std::set`, the set returns a `pair` object whose first element is an iterator pointing to the newly inserted element, or to an element that already holds an equal value (because `std::set` does not allow duplicates). The second element of the `pair` is a boolean indicating whether the insertion happened (`true` if a new element was actually inserted, `false` if an equivalent element already existed).

**Interval assignment**: just obtain the nodes containing the left and right endpoints of the interval to be modified, erase that whole span, and insert a new node with the assigned value and the interval's left and right endpoints. For the new interval `[l, r]`, you must call `split(r + 1)` before `split(l)` — right first, then left — otherwise you get an error. If you split at the left endpoint first and then at the right endpoint, the node produced by the earlier left split may be erased. For example, consider the interval `[1, 10]` and suppose we now want to modify the left endpoint 1 and the right endpoint 8:

Splitting at the left endpoint first gives the node `[1, 10]` containing the left endpoint; splitting at the right endpoint then gives `[1, 7]` and `[8, 10]`, and the node `[1, 10]` produced by the earlier left split is erased — an error is reported!

```cpp
// 区间赋值
void assign(ll l, ll r, ll v) {
    auto end = split(r + 1), begin = split(l);
    tree.erase(begin, end);
    tree.insert(node(l, r, v));
}
```

**k-th smallest in an interval**: just solve it by brute force.

```cpp
// 区间第k大数
ll kth(ll l, ll r, ll k) {
    auto end = split(r + 1);
    std::vector< std::pair<ll, ll> > v;
    for(auto it = split(l); it != end; ++it) {
        v.emplace_back(it -> v, it -> r - it -> l + 1);
    }
    std::sort(v.begin(), v.end());
    for(int i = 0; i < v.size(); ++i) {
        k -= v[i].second;
        if(k <= 0) {
            return v[i].first;
        }
    }
    return -1; // error return
}
```

**Interval power sum**: fast exponentiation + brute force.

```cpp
// 快速幂
ll qpow(ll a, ll n, ll mod) {
    ll res = 1;
    for( ; n; n >>= 1) {
        if(n & 1) {
            res = res * a % mod;
        }
        a = a * a % mod;
    }
    return res % mod;
}

// 区间快速幂求和
ll sum_of_pow(ll l, ll r, ll x, ll y) {
    ll res = 0;
    auto end = split(r + 1);
    for(auto it = split(l); it != end; ++it) {
        res = (res + qpow(it -> v, x, y) * (it -> r - it -> l + 1)) % y;
    }
    return res;
}
```
