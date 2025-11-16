// (deprecated) loadMarkdownBlog removed in favor of loadBlogPost

// Transform fenced ```pseudocode blocks into formatted pseudocode with line numbers and keyword highlighting
window.renderPseudocodeBlocks = function(root) {
  const blocks = root.querySelectorAll('pre > code.language-pseudocode, pre > code.language-algorithm, pre > code.language-ps');
  const kw = /\b(Algorithm|Input|Output|for|to|downto|do|end|if|then|else|elseif|while|repeat|until|return|function|procedure|break|continue|swap)\b/g;
  const comment = /(\/\/.*$)/;
  const escapeHtml = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  blocks.forEach(code => {
    const pre = code.parentElement;
    const text = code.textContent.replace(/\r/g,'');
    const lines = text.split('\n');
    const htmlLines = lines.map(line => {
      let h = escapeHtml(line);
      // highlight comments first
      if (comment.test(h)) {
        h = h.replace(comment, '<span class="cm">$1</span>');
      }
      // highlight keywords
      h = h.replace(kw, '<span class="kw">$1</span>');
      // arrows
      h = h.replace(/<-|⇐/g, '←');
      return `<span class="line">${h}</span>`;
    }).join('');
    const wrapper = document.createElement('div');
    wrapper.className = 'pseudocode';
    wrapper.innerHTML = `<div class="pseudo-code">${htmlLines}</div>`;
    pre.replaceWith(wrapper);
  });
}

// New: Load a markdown blog, extract frontmatter, render meta (title, subtitle, date, author),
// then render the markdown body with math & pseudocode.
function loadBlogPost(mdPath, metaSelector, contentSelector, defaults) {
  const siteDefaults = Object.assign({ author: 'Ferdous Alam' }, defaults || {});
  fetch(mdPath)
    .then(res => res.text())
    .then(md => {
      // Extract YAML frontmatter
      const metaMatch = md.match(/^---([\s\S]*?)---/);
      let meta = {};
      if (metaMatch) {
        metaMatch[1].split('\n').forEach(line => {
          const m = line.match(/^([^:]+):\s*(.*)$/);
          if (m) meta[m[1].trim()] = m[2].trim();
        });
      }
      const body = md.replace(/^---[\s\S]*?---\s*/, '');

      // Derive subtitle if missing: first non-empty, non-heading, non-table, non-fence line
      let subtitle = meta.subtitle || '';
      if (!subtitle) {
        const lines = body.split('\n');
        for (const ln of lines) {
          const t = ln.trim();
          if (!t) continue;
          if (t.startsWith('#') || t.startsWith('>') || t.startsWith('|') || t.startsWith('```')) continue;
          subtitle = t.replace(/<[^>]+>/g, '');
          break;
        }
      }

      // Render meta
      const metaEl = document.querySelector(metaSelector);
      metaEl.innerHTML = `
        <h1 class="blog-title-main">${meta.title || ''}</h1>
        <div class="blog-subtitle-main">${subtitle || ''}</div>
        <div style="height:0.1em;"></div>
        <div class="blog-meta-row">
          <span class="blog-date">${meta.date || ''}</span>
          <span class="blog-meta-vert"></span>
          <span class="blog-author">${meta.author || siteDefaults.author}</span>
        </div>
      `;

      // Render content
      const html = window.markdownToHtml(body);
      const container = document.querySelector(contentSelector);
      container.innerHTML = html;
      container.classList.add('blog-content-markdown');
      if (window.renderMathInElement) {
        renderMathInElement(container, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ]
        });
      }
      if (window.renderPseudocodeBlocks) {
        window.renderPseudocodeBlocks(container);
      }
    });
}

// Expose
window.loadBlogPost = loadBlogPost;
