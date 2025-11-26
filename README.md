# My Blog

A modern blog built with Astro, featuring content collections and a clean design.

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── blog/          # Blog images
│   ├── components/
│   │   ├── Header.astro
│   │   ├── PostCard.astro
│   │   └── PostListItem.astro
│   ├── content/
│   │   ├── blog/          # Blog posts (Markdown)
│   │   └── config.ts      # Content collections config
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── blog/
│   │   │   └── [...slug].astro
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project:

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm install` | Installs dependencies                        |
| `pnpm dev`     | Starts local dev server at `localhost:4321`  |
| `pnpm build`   | Build your production site to `./dist/`      |
| `pnpm preview` | Preview your build locally, before deploying |

## 📝 Writing Blog Posts

Blog posts are written in Markdown and stored in `src/content/blog/`. Each post should have frontmatter with:

- `title`: Post title
- `description`: Post description
- `pubDate`: Publication date
- `heroImage`: Path to hero image (use `@assets/blog/image.png` format)

## 🎨 Path Aliases

- `@assets/*` → `src/assets/*`
