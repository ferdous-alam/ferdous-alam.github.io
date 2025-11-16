// Populate home page blog list with title/subtitle/date from each post's markdown frontmatter
(function initHomeBlogList() {
  if (typeof document === 'undefined') return;
  const listEl = document.querySelector('.blogs-list');
  if (!listEl) return;

  function parseFrontmatter(md) {
    const fm = { };
    const m = md.match(/^---([\s\S]*?)---/);
    if (m) {
      m[1].split('\n').forEach(line => {
        const mm = line.match(/^([^:]+):\s*(.*)$/);
        if (mm) fm[mm[1].trim()] = mm[2].trim();
      });
    }
    const body = md.replace(/^---[\s\S]*?---\s*/, '');
    return { meta: fm, body };
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

  function toYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return String(d.getFullYear());
    const y = (dateStr.match(/(20\d{2}|19\d{2})/) || [])[1];
    return y || '';
  }

  function parseDate(d) {
    if (!d) return 0;
    const t = Date.parse(d);
    if (!isNaN(t)) return t;
    // try simple formats like "Nov 16, 2025" or "2025-11-16"
    return 0;
  }

  // Attempt to build list from an API first (if server is running), else fallback to manifest
  function buildFromApi() {
    return fetch('/api/posts')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('no api')))
      .then((items) => {
        listEl.innerHTML = '';
        items.forEach((p, idx) => {
          const year = toYear(p.date);
          const a = document.createElement('a');
          a.className = 'blog-item';
          a.href = `post.html?src=${p.src}`;
          if (year) a.setAttribute('data-year', year);
          a.innerHTML = `
            <div class="blog-meta">${p.date || ''}</div>
            <h3 class="blog-title">${p.title || ''}</h3>
            <div class="blog-subtitle">${p.subtitle || ''}</div>
          `;
          listEl.appendChild(a);
          if (idx < items.length - 1) {
            const sep = document.createElement('div');
            sep.className = 'blog-separator';
            listEl.appendChild(sep);
          }
        });
      });
  }

  // Attempt to build list from posts/manifest.json for modularity
  function buildFromManifest() {
    return fetch('posts/manifest.json')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('no manifest')))
      .then(async (entries) => {
        // entries can be ["posts/x.md", ...] or [{src: "posts/x.md"}, ...]
        const paths = entries.map(e => (typeof e === 'string') ? e : (e && e.src ? e.src : null)).filter(Boolean);
        const metas = await Promise.all(paths.map(p => fetch(p).then(r => r.text()).then(md => {
          const { meta, body } = parseFrontmatter(md);
          return { path: p, meta, body };
        })));
        // sort by date desc
        metas.sort((a, b) => parseDate(b.meta.date) - parseDate(a.meta.date));
        // build DOM
        listEl.innerHTML = '';
        metas.forEach((item, idx) => {
          const subtitle = item.meta.subtitle || deriveSubtitle(item.body);
          const year = toYear(item.meta.date);
          const keywords = item.meta.keywords || '';
          const a = document.createElement('a');
          a.className = 'blog-item';
          a.href = `post.html?src=${item.path}`;
          if (year) a.setAttribute('data-year', year);
          if (keywords) a.setAttribute('data-keywords', keywords);
          a.style.display = ''; // Ensure blogs are visible
          a.innerHTML = `
            <div class="blog-meta">${item.meta.date || ''}</div>
            <h3 class="blog-title">${item.meta.title || ''}</h3>
            <div class="blog-subtitle">${subtitle || ''}</div>
          `;
          listEl.appendChild(a);
          if (idx < metas.length - 1) {
            const sep = document.createElement('div');
            sep.className = 'blog-separator';
            listEl.appendChild(sep);
          }
        });
      });
  }

  function hydrateExistingItems() {
    const items = document.querySelectorAll('.blogs-list > a.blog-item');
    if (!items.length) return;
    items.forEach((item) => {
      const href = item.getAttribute('href') || '';
      let mdPath = '';
      // Support both legacy per-post pages and the new post.html?src=... format
      if (/post\.html\?/.test(href)) {
        const params = new URLSearchParams(href.split('?')[1] || '');
        mdPath = params.get('src') || params.get('md') || '';
      } else {
        mdPath = href.replace(/\.html(?:$|\?.*)/, '.md');
      }
      if (!mdPath.endsWith('.md')) return;

      fetch(mdPath)
        .then(r => r.ok ? r.text() : Promise.reject(new Error('fetch failed')))
        .then(md => {
          const { meta, body } = parseFrontmatter(md);
          const subtitle = meta.subtitle || deriveSubtitle(body);
          const titleEl = item.querySelector('.blog-title');
          const subtitleEl = item.querySelector('.blog-subtitle');
          const dateEl = item.querySelector('.blog-meta');
          if (meta.title && titleEl) titleEl.textContent = meta.title;
          if (subtitle && subtitleEl) subtitleEl.textContent = subtitle;
          if (meta.date && dateEl) dateEl.textContent = meta.date;
          const year = toYear(meta.date);
          if (year) item.setAttribute('data-year', year);
        })
        .catch(() => { /* keep existing text on error */ });
    });
  }

  buildFromApi()
    .catch(() => buildFromManifest())
    .catch(hydrateExistingItems);
})();
