---
type: post
layout: single
outputs: ["HTML"]
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"
date: {{ .Date }}
url: /posts/{{ .File.ContentBaseName }}/
# shown small above the title
eyebrow: "Field Notes"
# one-line standfirst under the title
lede: ""
# key/value pairs rendered as a small caption row (location, camera, year, …)
meta:
  - label: "Location"
    value: ""
  - label: "Year"
    value: ""
draft: true
---

Write the story here. Drop images inline with a size keyword as the title:

![A caption that also serves as alt text](photo.jpg "wide")

Sizes: `small`, `medium` (default), `large`, `wide`, `full`.

Put images side by side — the size keyword sets each one's width in the row:

{{</* row */>}}
![](left.jpg "small")
![](right.jpg "large")
{{</* /row */>}}
