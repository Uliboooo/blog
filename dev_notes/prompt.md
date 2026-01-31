# Blog

## Feature

- use Astro and gerenate all articles when build and push
- writable as md or mdx
- support meta data of articles. title, date, writer, description, Tag(e.g. rust, web, lisp, column, etc...)
- meta date will be used for previews (google search result, sharing in X and other SNS)
- support thumbnail Image(Optional)
- folder structure
this structure is part of blog system. i don't know about web develop. you have to add other file and folder(e.g. index.html?). i write only about articles mapping.
`.`: file
`d`: folder
```bash
.
d articles
    d title
        . title.md(or mdx)
        d images
            . thumbnail.png
            . figure.png
        . title2.md(or mdx)
    d title2
        . title2.md
        d images
            . thumbnail.png
            . figure.png
```

## Design

reference @./dev_notes/design_refe.png

simple, text main design, 

my Assumed design. (write as html like oritinal lang. please think indent as div deeps)

```
- body<width: 80%? desc: if wide to full size, it is difficult to read because human viewing angle is not large. but i don't optimal size. pleae you decide.>
    - top header content<flex, space-btw>
        - logo
        - menu<flex>
            - all articles(default)
            - List by tag
        - info
            - about me(https://about.uliboooo.dev/)
            - github(https://github.com/Uliboooo)
            - X(https://x.com/Uliboooo)
    - main content <flex, gap: true, ratio: 8:2>
        - articles or show a article <desc: when (= status top) (show articles link as box) (show rendered article content)>
        - Previous articles links <desc: show Previous articles links>
    - fotter
        - © 2025-2026 Uliboooo. All rights reserved.
        - View Source link(desc: i ready late)
```

use #fffff7 as bg color for reduce contrast between char and bg.

### fonts

- Title, Header, quotation is serif fonts
- Main text is Sans-serif fonts
- code is mono fonts.

```
# title

  font-family:
    "Times New Roman",
    "Yu Mincho",
    "Hiragino Mincho ProN",
    "Hiragino Sans Serif Interface",
    "Noto Serif JP",
    "MS Mincho",
    "IPAmjMincho",
    serif;

# plane text
  font-family: "Helvetica Neue",
    "Hiragino Kaku Gothic ProN",
    "Hiragino Sans",
    "Noto Sans JP",
    Arial,
    Meiryo,
    sans-serif;
```

