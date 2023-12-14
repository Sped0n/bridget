# Getting Started

The files in `exampleSite` is just a simple example. Now, we will introduce it based on the same structure.

## Requirements

Before you start, make sure you have installed Hugo **extended version**. For more information, see [Hugo's documentation](https://gohugo.io/getting-started/installing/).

Once you have installed Hugo, you can check the version by running the following command:

```shell
hugo version
```

Which should output something like this (the version number may be different), notice the `extended` keyword:

```shell
hugo v0.120.3-a4892a07b41b7b3f1f143140ee4ec0a9a5cf3970+extended darwin/arm64 BuildDate=2023-11-01T17:57:00Z VendorInfo=brew
```

The minimum required Hugo version can be seen in the [`theme.toml`](https://github.com/Sped0n/bridget/blob/main/theme.toml#L19).

## Installation

### Git

On the main branch, you can find the theme's latest source code. To use the latest version, you can clone the repository to `themes/bridget` by running the following command in the root directory of your Hugo site:

```shell
git clone https://github.com/Sped0n/bridget themes/bridget
```

If you are already using Git for your site, you can add the theme as a submodule by running the following command in the root directory of your Hugo site:

```shell
git submodule add https://github.com/Sped0n/bridget themes/bridget
```

After cloning/downloading theme files to the directory, if you want to customize the theme, please run `pnpm install` or `npm install` first.

### Module (recommended)

> If you want to modify the theme, use Git installation instead.

This theme is also available as a [Hugo module](https://gohugo.io/hugo-modules/). Run the following command in the root directory of your Hugo site:

First turn your site into a Hugo module (in case you haven't done it yet):

```shell
hugo mod init github.com/me/my-new-site
# or whatever you like, it doesn’t necessarily have to be a GitHub link.
hugo mod init blablabla
```

Then import the theme as a dependency adding the following line to the `module` section of your site's configuration file.

```toml
# config/_default/hugo.toml
[module]
[[module.imports]]
path = "github.com/Sped0n/bridget"
```

If you want to upgrade the theme, just run:

```shell
hugo mod get -u
```

## Content Management

The content is where the pictures/text is stored, while the static refers to the website icons.

```
.
├── content
│  ├── Erwitt
│  │  ├── 1.jpg
│  │  ├── ***
│  │  └── index.md
│  ├── Gruyaert
│  │  ├── 1.jpg
│  │  ├── ***
│  │  └── index.md
│  ├── Info
│  │  └── index.md
│  └── Webb
│     ├── 1.jpg
│     ├── ***
│     └── index.md
└── static
   ├── dot.png
   └── dot.svg
```

In each index.md file, there is a configuration file like this:

```markdown
---
type: _default
layout: single
url: /erwitt/
menu:
  main:
    weight: 3
    identifier: Erwitt
    title: Erwitt
unifiedAlt: '© Elliott Erwitt'
---
```

- keep the `type` and `layout` **untouched**;

- `url` is the href link to this page, in this case, you can visit this page with `blabla.com/erwitt`;

- `main` is the entry to `menu`;

- `weight` determines the position of this link in the navigation bar, with the first one being 1, the second one being 2, and so on;

- `identifier` should be the **same** as the name of the **upper-level directory**;

- `title` refers to the text that appears on the navigation bar;

- `unifiedAlt` is **optional**, If you left it empty, the alt attribute of the image will default to its file name; if it is set, the alt attributes of all images will be unified to the value you have set;

- If this is a **showcase** page, simply place the images in the same directory as index.md.

- If this is an **information** page, you can continue writing the information you want to display in index.md.

  > However, please note that the CSS for the information page **only provides simple styling for text**. If you have any requirements beyond text and the browser rendering does not meet your expectations, please modify [`_article.scss`](https://github.com/Sped0n/bridget/blob/main/assets/scss/_partial/_article.scss).

As for the **website icon**, place the files in static and then go to config part for further reading.

## Config

You can simply copy this to the root directory of your site with minor modifications, and you’ll be ready to proceed.

```
.
└── config
   └── _default
      ├── hugo.toml
      ├── markup.toml
      ├── params.toml
      └── sitemap.toml
```

### `hugo.toml`

We will focus on introducing the part about `theme as module`, detailed comments are provided for other options, so we won’t repeat them here.

```toml
# theme as module
[module]
replacements = "github.com/Sped0n/bridget -> ../.."
[[module.imports]]
path = "github.com/Sped0n/bridget"
```

- If you want to <u>modify the theme</u> or you have <u>installation with Git</u>, please **keep the `replacements` configuration** and change the path after the arrow to the location of your local theme file (relative path only).
- If you have <u>installation with Module</u>, **remove the `replacements` configuration**.

### `markup.toml`

**DO NOT TOUCH THIS**

### `params.toml`

Detailed description in the comments.

> ⚠️⚠️⚠️
>
> Only thing that you need to pay **extra attention** is the [`bundled`](https://github.com/Sped0n/bridget/blob/1e2f1fadde9c16989eef1ab771f2ac8463dec5a4/exampleSite/config/_default/params.toml#L6) option, please read the corresponding doc and set it as your need.

### `sitemap.toml`

https://gohugo.io/templates/sitemap-template/#configuration
