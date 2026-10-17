---
title: 'Building a Hugo Blog'
date: 2024-01-20T21:06:30+08:00
tags: ['hugo', '博客']
category: 'diary'
summary: 'A full walkthrough of building and deploying a personal blog with Hugo, the even theme and GitHub Actions'
draft: false
---

## Background

Site stack: **hugo + even + github actions**. References:
> https://ouuan.github.io/post/from-hexo-to-hugo/

## Build process

### Step 1 — adapted from [tom0727's setup guide](https://tom0727.github.io/post/001-hugo-tutorial/)

First read [ouuan's guide](https://ouuan.github.io/post/from-hexo-to-hugo/), then use his [hugo template](https://github.com/ouuan/hugo-blog-template) and clone it by following the instructions in the template.

### Step 2 — Editing the config
Still following the template's instructions, adjust the relevant settings in the config file `config.toml`. The things that need changing:
1. Every part containing `yourname`
2. `newContentEditor = ""`
3. `defaultContentLanguage = "en"`
4. The contents of `[[menu.main]]` (keep or delete entries as appropriate)
5. Do **not** change `version="4.x"` in `[params]`

**Note: one more thing to watch out for — running `hugo server` throws an error, because `google_news.html` is no longer supported. The fix is to delete `{{- template "_internal/google_news.html" . -}}` from `hugo/themes/even/layouts/partials/head.html`; see the [related discussion](https://discourse.gohugo.io/t/page-render-error/43594)**

### Step 2.5 — Creating the repository
Since I plan to deploy to GitHub Pages, I create a new repository on GitHub named `leesun1729.github.io`:

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/leesun1729/leesun1729.github.io.git
git branch -M master
git push -u origin master
```

### Step 3 — Local testing
Once the configuration is done, run `hugo new post/test.md` to create a new post (at `hugo-blog/content/post/test.md`), write something in Markdown, save it, then run `hugo server` and open localhost to check the result.
Finally, generate the static files with `hugo --theme=even --baseURL="https://leesun1729.github.io/" --buildDrafts`; that produces the `hugo-blog/public/` folder. Push its contents to GitHub and you are done.

```bash
cd public
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/leesun1729/leesun1729.github.io.git
git branch -M publish
git push -u origin publish
```

Note: the blog's source code and the site content are not the same thing!

1. Source code: everything under `hugo-blog/` except `hugo-blog/public/`, including files such as `content/` and `config.toml`.
2. Site content: only what is inside `hugo-blog/public/`. With the source code you can generate the site content using `hugo`, but not the other way round!

Since the two are different, they have to be managed separately. I keep them in the same repository, split across two branches: the source code lives in `master`, and the site content lives in `publish`.

### Step 4 — GitHub settings
At this point the page should still be empty, because GitHub Pages needs to be told which branch to deploy from. In the repository's `Settings`, scroll down to `GitHub Pages` and change the source branch:
![image](/images/001/1.png)

> To insert an image into a post, assuming the image is at `static/images/001/1.png`, write `![image](/images/001/1.png)`
> 
> To insert a link, write `[link_name](https://...)`. Remember to add `https://` to external links, otherwise they are treated as a local file path.

Once these steps are done it works. Of course, editing and republishing this way is tedious and switching branches is tiring, which is exactly why there is Step 5:

### Step 5 — GitHub Actions
Let's set up GitHub Actions; it can automate the deployment process. References:
> https://segmentfault.com/a/1190000021815477

Note that because the source code and the site content live in the same repository, there is no need to fiddle with secret keys on GitHub — just edit `hugo-blog/.github/workflows/deploy.yml` (this file ships with the template):
1. `personal_token: ${{ secrets.GITHUB_TOKEN }}`
2. `publish_dir: ./public`
3. `publish_branch: publish`
4. Change `depth` to `fetch-depth` (otherwise the build throws an error)

That's it. From now on, publishing a new article becomes:
1. `hugo new post/article.md`
2. Edit the post at `content/post/article.md`
3. add, commit, and push the source code to `master`

And that is all — no more switching branches to push the site content.

### Step 6 — Miscellaneous

For more details, refer to [tom0727's setup guide](https://tom0727.github.io/post/001-hugo-tutorial/)
