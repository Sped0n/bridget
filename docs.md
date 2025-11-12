### Contents

- [Prequisites](#prequisites)
- [Installation](#installation)
  - [Hugo Modules (Recommended)](#hugo-modules-recommended)
  - [Git Repository (For Customizations)](#git-repository-for-customizations)
- [Content Management](#content-management)
  - [`index.md`](#indexmd)
    - [Front Matter](#front-matter)
    - [Markdown Content](#markdown-content)
  - [Favicon](#favicon)
- [Configuration](#configuration)
  - [`hugo.toml`](#hugotoml)
  - [`markup.toml`](#markuptoml)
  - [`outputs.toml`](#outputstoml)
  - [`params.toml`](#paramstoml)
  - [`sitemap.toml`](#sitemaptoml)
- [Usage](#usage)
- [Customizations](#customizations)
  - [Change Font](#change-font)
  - [Add a Custom Analytic Script](#add-a-custom-analytic-script)

---

## Prequisites

_[Contents](#contents)_

- [Hugo (extended)](https://gohugo.io/installation/), minimum required version can be seen in the [`theme.toml`](https://github.com/Sped0n/bridget/blob/main/theme.toml#L19)

  ```bash
  ❯ hugo version
  hugo v0.152.2+extended+withdeploy darwin/arm64 BuildDate=unknown VendorInfo=nixpkgs
  ```

- [pnpm](https://pnpm.io/installation) and [Node.js](https://nodejs.org/en/download), please note that these two are only needed for customizations or development.

  ```bash
  ❯ pnpm --version && node --version
  10.20.0
  v22.20.0
  ```

## Installation

_[Contents](#contents)_

### Hugo Modules (Recommended)

_[Contents](#contents)_

> [!IMPORTANT]
> Checkout https://gohugo.io/hugo-modules/use-modules/#prerequisite before using Hugo Modules.

First turn your site into a Hugo module (in case you haven't done it yet):

```bash
hugo mod init github.com/me/my-new-site
# or whatever you like, it doesn’t need to be a valid GitHub repo link.
hugo mod init blablabla
```

Then import the theme as a dependency adding the following line to the `module` section of your site's configuration file.

```toml
# config/_default/hugo.toml
[module]
[[module.imports]]
path = "github.com/Sped0n/bridget/v2"
```

If you want to upgrade the theme, just run:

```shell
hugo mod get -u
```

### Git Repository (For Customizations)

_[Contents](#contents)_

First clone the repository into your `themes` directory:

```bash
# latest version (main branch, might be unstable)
git clone https://github.com/Sped0n/bridget themes/bridget

# and you can checkout to a specific stable version, see https://github.com/Sped0n/bridget/releases
cd themes/bridget
git checkout v1.0.0
```

If you are already using Git for your site, you can add the theme as a submodule by running the following command in the root directory of your Hugo site:

```bash
git submodule add https://github.com/Sped0n/bridget themes/bridget
```

## Content Management

_[Contents](#contents)_

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

### `index.md`

_[Contents](#contents)_

#### Front Matter

_[Contents](#contents)_

Inside each index.md file, there is a front matter like this:

```markdown
---
type: _default # just copy
layout: single # just copy
url: /erwitt/
menu:
  main:
    weight: 3
    identifier: Erwitt
    title: Erwitt
unifiedAlt: '© Elliott Erwitt'
build:
  publishResources: false # just copy
---
```

- `url` is the href link to this page, in this case, you can visit this page with `blabla.com/erwitt`;
- `main` is the entry to `menu`;
  - `weight` determines the position of this link in the navigation bar, with the first one being 1, the second one being 2, and so on;
  - `identifier` should be the **same** as the name of the **upper-level directory**;
  - `title` refers to the text that appears on the navigation bar;
- `unifiedAlt` is **optional**, If you left it empty, the alt attribute of the image will default to its file name; if it is set, the alt attributes of all images will be unified to the value you have set;

#### Markdown Content

_[Contents](#contents)_

- If this is a **showcase** page:
  - No need to write anything in index.md.
  - Place the images in the same directory as `index.md`.
- If this is an **information** page:
  - You can write anything in index.md, and it will be rendered as HTML.
  - However, please note that the CSS for the information page **only provides simple styling for text**. If you have any requirements beyond text and the browser rendering does not meet your expectations, please modify [`_article.scss`](https://github.com/Sped0n/bridget/blob/main/assets/scss/_partial/_article.scss).

### Favicon

_[Contents](#contents)_

As for the **website icon**, place the files under `static` directory and then go to [config](#configuration) part for further reading.

## Configuration

_[Contents](#contents)_

You can simply copy `exampleSite/config` to the root directory, with some minor modifications and you should be good to go.

```
.
└── config
   └── _default
      ├── hugo.toml
      ├── markup.toml
      ├── outputs.toml
      ├── params.toml
      └── sitemap.toml
```

### `hugo.toml`

_[Contents](#contents)_

First, what you need to modify is the `baseURL` and `title`:

```toml
# timeout
timeout = "1200s"
# your website url
baseURL = 'https://bridget-demo.sped0n.com' # <-- MODIFY ME
# website title
title = 'Bridget' # <-- MODIFY ME
# don't touch this
disableKinds = ["section", "taxonomy", "term", "home"]
# robots.txt
enableRobotsTXT = true
```

Depend on which [installation](#installation) method you choose, you need to modify the `module` section:

- If you use [Hugo Modules](#hugo-modules-recommended):

  ```toml
  [module]
  [[module.imports]]
  path = "github.com/Sped0n/bridget/v2"
  ```

- If you use [Git Repository](#git-repository-for-customizations):

  ```toml
  [module]
  # This is the relative path to hugo theme directory([official doc](https://gohugo.io/hugo-modules/configuration/#module-configuration-top-level))**.
  replacements = "github.com/Sped0n/bridget/v2 -> ../.."
  [[module.imports]]
  path = "github.com/Sped0n/bridget/v2"
  ```

### `markup.toml`

_[Contents](#contents)_

**Just copy it.**

### `outputs.toml`

_[Contents](#contents)_

**Just copy it.**

_[Contents](#contents)_

### `params.toml`

_[Contents](#contents)_

Detailed description in the comments.

### `sitemap.toml`

_[Contents](#contents)_

https://gohugo.io/templates/sitemap-template/#configuration

## Usage

_[Contents](#contents)_

Bridget will work as a normal Hugo theme (if you don't have needs to customize), https://gohugo.io/getting-started/usage/ is a great start.

For further reading, you can refer to the `scripts` field of `package.json`.

## Customizations

_[Contents](#contents)_

> [!IMPORTANT]
> Please make sure you have [installation with Git](#git-repository-for-customizations).
>
> If you want to try some changes on the `exampleSite`, below are some commands you might need:
>
> - `pnpm install` to install dependencies.
> - `pnpm run dev` to start a dev server (`http://localhost:1313`).
> - `pnpm run build` to update artifacts.

### Change Font

_[Contents](#contents)_

These are the places you need to focus on:

- `assets/scss/_core/_font.scss` (`@font-face`)
- `assets/scss/_core/_typography.scss` (`body.font-family`)
- `layouts/partials/head/link.html` (`preload`)
- `static/lib/fonts/GeistVF.woff2` (font file itself)

### Add a Custom Analytic Script

_[Contents](#contents)_

Go to `layouts/_default/baseof.html`:

```html
<!doctype html>
<html lang="{{- site.LanguageCode -}}">
  <head>
    /* ---------- INSERT HERE ---------- */
  </head>
  <body lang="{{- site.LanguageCode -}}">
    <div class="analytics">/* ---------- OR HERE ---------- */</div>
  </body>
</html>
```
