#!/usr/bin/env node
/**
 * Generate posts/manifest.json from markdown files in posts/
 * Sorts by frontmatter date (descending). Accepts common date strings parseable by Date.parse.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const postsDir = path.join(root, 'posts');
const manifestPath = path.join(postsDir, 'manifest.json');

function parseFrontmatter(md) {
  const m = md.match(/^---([\s\S]*?)---/);
  const meta = {};
  if (m) {
    m[1].split('\n').forEach(line => {
      const mm = line.match(/^([^:]+):\s*(.*)$/);
      if (mm) meta[mm[1].trim()] = mm[2].trim();
    });
  }
  return meta;
}

function parseDateTs(dateStr) {
  if (!dateStr) return 0;
  const t = Date.parse(dateStr);
  return isNaN(t) ? 0 : t;
}

(async function main(){
  try {
    if (!fs.existsSync(postsDir)) {
      console.error('posts/ directory not found at', postsDir);
      process.exit(1);
    }
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const entries = files.map(f => {
      const full = path.join(postsDir, f);
      const md = fs.readFileSync(full, 'utf8');
      const fm = parseFrontmatter(md);
      return { src: `posts/${f}`, dateTs: parseDateTs(fm.date) };
    });
    entries.sort((a, b) => b.dateTs - a.dateTs);
    const out = entries.map(e => e.src);
    fs.writeFileSync(manifestPath, JSON.stringify(out, null, 2) + '\n');
    console.log('Wrote', manifestPath, 'with', out.length, 'entries');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
