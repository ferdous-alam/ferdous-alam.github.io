#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const root = __dirname;
const postsDir = path.join(root, 'posts');

function parseFrontmatter(md) {
  const m = md.match(/^---([\s\S]*?)---/);
  const meta = {};
  let body = md;
  if (m) {
    m[1].split('\n').forEach(line => {
      const mm = line.match(/^([^:]+):\s*(.*)$/);
      if (mm) meta[mm[1].trim()] = mm[2].trim();
    });
    body = md.replace(/^---[\s\S]*?---\s*/, '');
  }
  return { meta, body };
}

function deriveSubtitle(body) {
  const lines = body.split('\n');
  for (const ln of lines) {
    const t = ln.trim();
    if (!t) continue;
    if (t.startsWith('#') || t.startsWith('>') || t.startsWith('|') || t.startsWith('```')) continue;
    return t;
  }
  return '';
}

function parseDateTs(dateStr) {
  if (!dateStr) return 0;
  const t = Date.parse(dateStr);
  return isNaN(t) ? 0 : t;
}

app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const items = files.map(f => {
      const full = path.join(postsDir, f);
      const md = fs.readFileSync(full, 'utf8');
      const { meta, body } = parseFrontmatter(md);
      const subtitle = meta.subtitle || deriveSubtitle(body);
      return {
        src: `posts/${f}`,
        title: meta.title || '',
        date: meta.date || '',
        author: meta.author || '',
        subtitle,
        ts: parseDateTs(meta.date),
      };
    });
    items.sort((a, b) => b.ts - a.ts);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list posts' });
  }
});

// Serve static files for local dev
app.use(express.static(root));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
