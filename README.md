# Minimal Markdown-Driven Blog

This is a lightweight static blog that renders posts written in Markdown with math (KaTeX), code blocks, tables, and pseudocode. Posts live in `posts/` and are displayed on the home page sorted by date.

Live at: **https://ferdous-alam.github.io/**

## 🚀 Quick Start - Add a New Blog Post

**The easiest way (recommended):**

1. Create a new Markdown file in `posts/` with YAML frontmatter:

   ```markdown
   ---
   title: My Awesome Blog Post
   date: Nov 16, 2025
   author: Ferdous Alam
   subtitle: A brief description of your post
   keywords: math, coding, tutorial
   ---
   
   Your content here. Math like $e^{i\pi}+1=0$ and code fences work!
   ```

2. Deploy with one command:

   ```bash
   npm run deploy
   ```

   This will automatically:
   - Regenerate `posts/manifest.json`
   - Commit the changes
   - Push to GitHub
   - Your blog appears on the site in 1-2 minutes!

**Alternative manual workflow:**

```bash
npm run build:manifest  # Update manifest
git add .
git commit -m "Add new blog post"
git push origin main
```

## 🛠️ Local Development

To preview your site locally:

```bash
npm install
npm run dev
# Open http://localhost:3000
```

The dev server provides an API endpoint that automatically lists all posts, so you don't need to rebuild the manifest while developing.

## 📝 How It Works

- The home page script (`public/home.js`) reads `posts/manifest.json`
- It loads each post's frontmatter and renders the list sorted by date (descending)
- Clicking a post opens `post.html?src=posts/<file>.md` which renders the full content
- KaTeX auto-render is enabled for beautiful math equations
- Supports code blocks, tables, and pseudocode (use triple-backticks with `pseudocode` tag)

## 🌐 Deploy to GitHub Pages

**Initial Setup (already done for this repo):**

1. Repository name must be `username.github.io` (e.g., `ferdous-alam.github.io`)
2. Repository must be public
3. The `.nojekyll` file ensures all files (including `.md`) are served correctly
4. GitHub Pages automatically builds from the `main` branch

**Your site is live at:** https://ferdous-alam.github.io/

After pushing changes with `npm run deploy`, wait 1-2 minutes for GitHub to rebuild.

## 📦 Available Scripts

- `npm run dev` - Start local development server at http://localhost:3000
- `npm run build:manifest` - Regenerate posts/manifest.json from markdown files
- `npm run deploy` - Auto-build manifest, commit, and push to GitHub (all-in-one)

## 📄 Frontmatter Format

```markdown
---
title: Your Post Title (required)
date: Nov 16, 2025 (required for sorting)
author: Your Name
subtitle: Brief description (shown on home page)
keywords: comma, separated, keywords
---
```

Dates can be in any format parseable by JavaScript's `Date.parse()`:
- `Nov 16, 2025`
- `2025-11-16`
- `November 16, 2025`

## ✨ Features

- ✅ Markdown with frontmatter
- ✅ Math rendering with KaTeX ($inline$ and $$display$$)
- ✅ Code syntax highlighting
- ✅ Dark/light theme toggle
- ✅ Search functionality
- ✅ Responsive design
- ✅ No build step required (pure static)
- ✅ Automatic blog list generation

## Deploy to GitHub Pages

You have two hosting modes:

1) User/Org site (username.github.io)
- Push this repository as the root of `username.github.io`.
- Asset paths are relative (e.g., `public/styles.css`), so it works as-is.
- Enable GitHub Pages in Settings → Pages and choose “GitHub Actions”.

2) Project site (username.github.io/repo-name)
- Works as-is because we use relative paths (no leading `/`).
- Enable GitHub Pages in Settings → Pages and choose “GitHub Actions”.
- This repo already includes `.github/workflows/gh-pages.yml` which:
   - Installs Node
   - Runs `npm run build:manifest` to regenerate `posts/manifest.json`
   - Publishes the repository as a static site

Steps:
1. Ensure your default branch is `main` or `master` (workflow listens to both).
2. Push to GitHub.
3. In Settings → Pages, set Source to “GitHub Actions”.
4. Wait for the workflow to finish; it will produce a Pages URL.

If you don’t want a workflow, you can also build the manifest locally (`npm run build:manifest`) and configure Pages to serve from the repository (root). The included `.nojekyll` avoids Jekyll processing.
