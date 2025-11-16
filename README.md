# Minimal Markdown-Driven Blog

This is a lightweight static blog that renders posts written in Markdown with math (KaTeX), code blocks, tables, and pseudocode. Posts live in `posts/` and are displayed on the home page sorted by date.

## Add a new post (two options)

1) No server (pure static): use a tiny manifest file

Create a new Markdown file in `posts/` with YAML frontmatter:

   ```markdown
   ---
   title: My New Post
   date: Nov 16, 2025
   author: Your Name
   subtitle: One-line summary of the post.
   ---
   
   Your content here. Math like $e^{i\pi}+1=0$ and code fences work.
   ```

Regenerate the manifest so the home page can discover your new file:

   - Option A: Use the provided Node script (requires Node.js installed):
     
     ```bash
     node scripts/build-manifest.js
     ```
   
   - Option B: Manually update `posts/manifest.json` and add your file path (e.g., `"posts/my-new-post.md"`).

2) No manifest: run the tiny API server for local/dev

The browser cannot list folder contents on its own in a static site. If you prefer to avoid a manifest, run the included dev server which exposes `/api/posts` by enumerating files in `posts/` on the server side. The home page will use this API automatically when available.

```bash
npm install
npm run dev
# open http://localhost:3000
```

When deployed without the server (e.g., GitHub Pages), the site will fall back to `posts/manifest.json` or any static links in `index.html`.

The home page script (`public/home.js`) will read `posts/manifest.json`, load each post's frontmatter, and render the list sorted by `date` (descending). Clicking a post opens `post.html?src=posts/<file>.md`, which renders the full content with math and pseudocode.

## Notes

- Dates should be in a format parseable by the browser (e.g., `Nov 16, 2025` or `2025-11-16`).
- If `/api/posts` is available (when running the dev server), the home page will auto-list all markdown files in `posts/` sorted by `date` without requiring a manifest.
- If `posts/manifest.json` is missing and no server is running, the home page will fall back to any static links already present in `index.html` and "hydrate" their title/subtitle from the post frontmatter.
- KaTeX auto-render is enabled on both the home page and post pages.
- Pseudocode blocks use triple-backticks with a `pseudocode` language tag.

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
