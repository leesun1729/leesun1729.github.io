+++
title = 'Hugo博客搭建记'
date = 2024-01-20T21:06:30+08:00
draft = false
categories = ['工程']
tags = ['hugo', '博客']
+++

## 前述

网站构成: **hugo + even + github actions** , 参考资料:
> https://ouuan.github.io/post/from-hexo-to-hugo/

## 搭建过程

### Step 1 引自[tom0727的搭建指南](https://tom0727.github.io/post/001-hugo-tutorial/)

首先阅读[ouuan的指南](https://ouuan.github.io/post/from-hexo-to-hugo/)，然后使用他的[hugo模版](https://github.com/ouuan/hugo-blog-template)，按照模版里指示的进行clone

### Step 2 Config的修改
还是按照模版里指示的，修改一下配置文件`config.toml`里的相关配置，一些需要更改的内容：
1. 包含`yourname`的部分
2. `newContentEditor = ""`
3. `defaultContentLanguage = "en"`
4. `[[menu.main]]`的相关内容 (视情况进行保留和删除)
5. **不要**更改 `[params]` 中的 `version="4.x"`

**注:这里还有一个需要注意的，执行命令`hugo server`会出现报错，因为现在不支持`google_news.html`,解决办法删除目录`hugo/themes/even/layouts/partials/head.html`的`{{- template "_internal/google_news.html" . -}}`,[相关讨论](https://discourse.gohugo.io/t/page-render-error/43594)**

### Step 2.5 创建repository
因为我打算部署到github pages上，就在github上创建一个新的repository，叫`leesun1729.github.io`

```
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/leesun1729/leesun1729.github.io.git
git branch -M master
git push -u origin master
```

### Step 3 本地测试
配置完成后，可以 `hugo new post/test.md` 创建一个新的post(在`hugo-blog/content/post/test.md`), 按照markdown随便写点东西以后保存，然后 `hugo server`，打开localhost看一下效果
最后用`hugo --theme=even --baseURL="https://leesun1729.github.io/" --buildDrafts`命令生成静态文件，就是`hugo-blog/public/`文件夹，把这个文件夹内的内容push到github上就可以了
```
cd public
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/leesun1729/leesun1729.github.io.git
git branch -M publish
git push -u origin publish
```


注： blog的源代码和网页内容并不是一个东西!

1. 源代码: 是`hugo-blog/` 下除了`hugo-blog/public/`以外的内容，包含了 `content/`, `config.toml` 之类的文件。
2. 网页内容：只是 `hugo-blog/public/`内的内容，有了源代码就可以用`hugo`生成网页内容，但是反之就不可以！

既然两者有别，就要分开管理，我把它们放在同一个repository里，分成2个branch。源代码就放在了`master`里，网页内容就放在`publish`上了。

### Step 4 Github Settings
这个时候网页上应该是没有内容的，因为github pages需要设置一下指定deploy的branch，在repository的`Settings`里，拉到下面看到`GitHub Pages`，改一下Source branch就可以了：
![image](/images/001/1.png)

> 需要在博文里插入图片的话，假设图片位于 `static/images/001/1.png`，就写上`![image](/images/001/1.png)`
> 
> 如果是插入link的话，就写 `[link_name](https://...)` 即可，外部链接记得加`https://`，不然会被当作本地的某个文件位置。

这些步骤做完就可以了，当然这种修改然后发布的方式太麻烦了，切branch也很累，所以就有了Step 5:

### Step 5 Github Actions
我们配置一下Github actions，它能自动化部署流程。参考资料:
> https://segmentfault.com/a/1190000021815477

需要注意，因为源代码和网页内容在同一个repository里，就不用在github上折腾secret key之类的了，直接修改一下 `hugo-blog/.github/workflows/deploy.yml` (这个是template里自带的) 即可：
1. `personal_token: ${{ secrets.GITHUB_TOKEN }}`
2. `publish_dir: ./public`
3. `publish_branch: publish`
4. 将 `depth` 改成 `fetch-depth`  (不然build的时候会报错)

这样就完成了，从此以后，写一篇新文章的步骤就变成：
1. `hugo new post/article.md`
2. 修改位于`content/post/article.md`的博客文章
3. add, commit, 把源代码push到`master`

这样就可以了，不必切branch然后push网页内容了。


### Step 6 其他

更多内容请参考[tom0727的搭建指南](https://tom0727.github.io/post/001-hugo-tutorial/)