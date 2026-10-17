---
title: 'C++ Operator Overloading'
date: 2024-01-20T21:50:09+08:00
tags: ['优先队列', '运算符重载']
category: 'algorithms'
summary: 'Explains how priority_queue works internally, plus operator overloading and custom comparison functions'
draft: false
---

## **Internal implementation**

`priority_queue` is a container adapter in the C++ Standard Template Library (STL) that provides priority queue functionality. It lets users efficiently add new elements to the collection, remove the largest element (or whichever element a supplied comparison function treats as the "top"), and read the value of the top element without removing it. It is not a complete container class but an adapter built on top of an actual container; by default the underlying container is usually `std::vector`. Its internal implementation is based on the heap data structure.

An overview of the key concepts and the implementation of `priority_queue`:

1. **Underlying container**:
`priority_queue` uses a random-access container as its underlying data structure and maintains a heap on top of it. The default container is `std::vector`, but you can use any random-access container, such as `std::deque`. You cannot operate on that container directly, because `priority_queue` only exposes the queue-related interface.
2. **Heap operations**:
The core of the internal implementation is the heap algorithms, such as `std::make_heap`, `std::push_heap` and `std::pop_heap`, which are defined in the `<algorithm>` header. When you add or remove elements, `priority_queue` uses these algorithms to keep the elements correctly ordered.
    - `std::make_heap`: builds the elements in the underlying container into a heap; this is usually called once when the `priority_queue` is constructed.
    - `std::push_heap`: when a new element is appended to the end of the underlying container, this algorithm rearranges elements to maintain the heap property.
    - `std::pop_heap`: when the top element is removed, this algorithm moves the element at the bottom of the heap to the top and then rearranges the heap to restore its order.
3. **Heap properties**:
A heap is a complete binary tree, usually represented by an array. For a max-heap, every node's value is greater than or equal to the values of its children. For a min-heap (obtained by supplying the `std::greater` comparator or by another means), it is exactly the opposite: every node's value is less than or equal to the values of its children.
4. **Accessing the top element**:
Because of the heap property, the top element is always at `begin()` of the underlying container, and the `top()` method of `priority_queue` simply returns the element at that position.
5. **Adding and removing elements**:
    - Adding an element: call `push()` and the element is appended to the end of the underlying container (because the underlying container is usually `std::vector`), then the `std::push_heap` algorithm is called to rearrange the elements and preserve heap order.
    - Removing an element: call `pop()`; `std::pop_heap` is invoked first and swaps the top element with the bottom element, then the last element of the container (the former heap top) is removed, and finally the heap property is maintained.
6. **Comparator function**:
`priority_queue` lets the user supply an optional comparison function to customize the priority of elements. If none is supplied, `std::less` is used to build a max-heap. Supplying `std::greater` as the comparator builds a min-heap.

`priority_queue:` O(1) to obtain the largest (or smallest) element, and O(log n) to add and remove elements

### Basic priority queue operations / usage

```cpp
q.empty(); 队列为空返回1
q.pop();   出队
q.push();  入队
q.top();   返回队列中优先级最高的元素
q.size();  返回队列中元素的个数
```

```cpp
// 默认优先队列 priority_queue 是最大堆
priority_queue<int> q;
q.push(1);   // q : 1
q.push(2);   // q : 2 , 1
q.push(3);   // q : 3 , 2 , 1
cout << q.top() << '\n'; // 3
q.pop();
cout << q.top() << '\n'; // 2
q.pop();
cout << q.top() << '\n'; // 1
```

```cpp
//定义优先级队列q，less表示按照递减(从大到小)的顺序插入元素，与默认情况相同
priority_queue<int,vector<int>,less<int>> q;

//定义优先级队列q，greater表示按照递增（从小到大）的顺序插入元素
priority_queue<int,vector<int>,greater<int>> q;
```

### About overloading operators for a priority queue

```cpp
struct point{
    int x;
    int y;
    int times;
    friend bool operator < (point a, point b)
    {
        return a.times > b.times;    //重载小于号使得小的先出队列
    }
};

// 默认情况下，队列中应按从大到小排序
priority_queue<point> q;

// 在此处定义一个优先队列priority_queue<point> q;
// 如果要按照以times进行从小到大排列，操作如上。进行重载 < 操作符。
// 意思是如果a.times > b.times成立，那么结构体point a < point b成立。
// 由于优先队列是按照从大到小排列，所以结构体b会排列到a之前，然而b.times是最小的，
// 所以实现了按照times的从小到大排序
```

### Inside the struct

Approach 1

```cpp
struct Point {
	int x, y;
  // 为两个结构体参数，结构体调用一定要写上friend
	friend bool operator < (Point a, Point b) {
        if(a.x == b.x)
            return a.y < b.y;
		return a.x < b.x;   // 按x从小到大排
	}
};
```

Approach 2

```cpp
struct Point {
    int x, y;
		// 直接传入一个参数，不必要写friend
    bool operator < (const Point &a) const {
        if(x == a.x)
            return y < a.y;
        return x < a.x;   // 按x升序排列
    }
};
```

The priority queue internally uses a heap data structure, most commonly in the form of a max-heap or a min-heap. In the C++ standard library implementation, `std::priority_queue` is a max-heap by default. This means that the top of the queue (the element returned by `top()`) is the "largest" of all elements. More precisely, if no comparison is specified, the priority queue uses `std::less` as its internal comparison object, and that object uses the element type's `<` operator to decide the order of elements.

So why overload `<` instead of `>`? In C++, overloading the `<` operator has several traditional and practical reasons:

1. **Consistent with sorting conventions**: sorting algorithms and containers usually use the `<` operator to determine order, and the "natural order" of a list or array is ascending.
2. **Concise default behavior**: overloading `<` means users can use standard library containers and algorithms such as `std::sort`, `std::set`, `std::map` directly without specifying an extra comparison function.
3. **Compatibility**: standard library containers sort with `<` by default. So, for uniformity, overloading `<` lets custom types work seamlessly with those containers.
4. **Minimal overloading**: in C++, once you have overloaded `<`, you can use the standard comparison function objects `std::less` (the default) and `std::greater` to build a min-heap and a max-heap. If you only overload `>`, you cannot use `std::less` directly, because it depends on the `<` operator.

For `std::priority_queue`, if you want to change the ordering and build a min-heap (smallest element first), you can overload `<` like this:

```cpp
bool operator<(const node &other) const {
    return val > other.val; // 对于优先队列来说，这样会让小值优先
}
```

Or you can use a custom comparison type:

```cpp
struct CompareNode {
    bool operator()(const node& n1, const node& n2) {
        return n1.val > n2.val; // 也是小值优先
    }
};

std::priority_queue<node, std::vector<node>, CompareNode> queue;
```

One benefit of this approach is that the intent of the code is extremely clear — the moment you see the comparison function, you know how the queue is ordered. It also keeps the type's ordinary `<` operator meaning literally "less than", which helps keep the code intuitive and consistent.

### Outside the struct

```cpp
//定义的比较结构体
//注意：cmp是个结构体
struct cmp {//自定义排序规则
	bool operator()(const Point& a,const Point& b) {
        if(a.x == b.x)
            return a.y < b.y;
		return a.x < b.x; //将小于号比较规则替换为结构体x比较规则
	}//如果要升序改变不等号方向就好
};

//初始化定义
priority_queue<Point,vector<Point>, cmp> q;
```

### A custom comparison function, usable with `sort`

```cpp
struct Point {
    int x, y;
}p[1005];

bool cmp(Point a, Point b) {
    if(a.x == b.x)
        return a.y < b.y;
    return a.x < b.x;
}
sort(p + 1, p + 1 + 1000, cmp);
```

### A custom comparison rule as a lambda, inline in `sort`

```cpp
struct Point {
		int x, y;
}p[1005];

// 方式一
sort(p + 1, p + 1 + 1000, [](const Point &p1, const Point &p2){
		return p1.x < p2.x;
});

// 方式二， [&]：取地址符，作用是引用sort之外的其他变量，在函数比较中，
// 如果需要用到sort之外的变量可使用[&]来直接使用
sort(p + 1, p + 1 + 1000, [&](const Point &p1, const Point &p2){
		return p1.x < p2.x;
});

const int N = 1005;
std::vector<Point> P(N);

// STL容器的两种写法
sort(P.begin(), P.end(), [](const Point &p1, const Point &p2){
		return p1.x < p2.x;
});

sort(begin(P), end(P), [](const Point &p1, const Point &p2){
		return p1.x < p2.x;
});
```
