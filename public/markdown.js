// Lightweight markdown renderer with support for:
// - headings (#, ##, ###)
// - paragraphs
// - inline code `...`
// - fenced code blocks ```lang ... ```
// - unordered/ordered lists
// - links [text](url)
// - basic tables (GitHub style)
// - leaves LaTeX math ($ ... $, $$ ... $$) untouched for KaTeX
function renderMarkdown(md) {
  md = md.replace(/\r/g, '');
  const lines = md.split(/\n/);

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function applyInline(s) {
    // inline code first to avoid interfering with other replacements
    s = s.replace(/`([^`]+)`/g, (m, code) => `<code>${escapeHtml(code)}</code>`);
    s = s.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    s = s.replace(/\*(.*?)\*/g, '<i>$1</i>');
    s = s.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    return s;
  }

  let i = 0;
  const out = [];
  const N = lines.length;
  while (i < N) {
    let line = lines[i];

    // Skip pure whitespace lines
    if (/^\s*$/.test(line)) { i++; continue; }

    // Preserve HTML blocks (div, script, etc.)
    if (/^\s*<(div|script|style|a|button|img)/i.test(line)) {
      const htmlLines = [line];
      const tagMatch = line.match(/<(\w+)/);
      const tag = tagMatch ? tagMatch[1] : null;
      i++;
      
      // If it's a self-closing tag or closed on same line, just output it
      if (line.includes('/>') || (tag && line.includes(`</${tag}>`))) {
        out.push(htmlLines.join('\n'));
        continue;
      }
      
      // Otherwise, collect until closing tag
      while (i < N && !(tag && lines[i].includes(`</${tag}>`))) {
        htmlLines.push(lines[i]);
        i++;
      }
      if (i < N) { 
        htmlLines.push(lines[i]); 
        i++; 
      }
      out.push(htmlLines.join('\n'));
      continue;
    }

    // Fenced code block
    const fence = line.match(/^```\s*([A-Za-z0-9_+-]*)\s*$/);
    if (fence) {
      const lang = fence[1] || '';
      i++;
      const buf = [];
      while (i < N && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      // consume closing fence if present
      if (i < N && /^```\s*$/.test(lines[i])) i++;
      out.push(`<pre><code class="language-${lang}">${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // Table detection: header row with pipes followed by a separator row
    if (line.includes('|') && i + 1 < N && /\|?\s*:?-{3,}.*\|?.*/.test(lines[i + 1])) {
      const headerCells = line.split('|').map(c => c.trim()).filter(Boolean);
      const alignSpec = lines[i + 1].split('|').map(c => c.trim());
      i += 2; // skip header + separator
      const rows = [];
      while (i < N && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
        rows.push(cells);
        i++;
      }
      const thead = `<thead><tr>${headerCells.map(h => `<th>${applyInline(h)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${applyInline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < N && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push(`<ul>${items.map(it => `<li>${applyInline(it)}</li>`).join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < N && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push(`<ol>${items.map(it => `<li>${applyInline(it)}</li>`).join('')}</ol>`);
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) { out.push(`<h3>${applyInline(h3[1])}</h3>`); i++; continue; }
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) { out.push(`<h2>${applyInline(h2[1])}</h2>`); i++; continue; }
    const h1 = line.match(/^#\s+(.*)$/);
    if (h1) { out.push(`<h1>${applyInline(h1[1])}</h1>`); i++; continue; }

    // Math block $$ ... $$ possibly multi-line or same-line
    if (/^\s*\$\$/.test(line)) {
      const trimmed = line.trim();
      // Case 1: start and end on the same line: $$ ... $$
      if (/^\$\$.*\$\$$/.test(trimmed) && trimmed !== '$$' && trimmed !== '$$$$') {
        out.push(line);
        i++;
        continue;
      }
      // Case 2: multi-line block
      const buf = [line];
      i++;
      while (i < N && !/\$\$\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < N) { buf.push(lines[i]); i++; }
      out.push(buf.join('\n'));
      continue;
    }

    // Paragraph: collect until blank line or block start
    const plines = [line];
    i++;
    while (i < N && !/^\s*$/.test(lines[i]) &&
           !/^```/.test(lines[i]) &&
           !/^\s*[-*]\s+/.test(lines[i]) &&
           !/^\s*\d+\.\s+/.test(lines[i]) &&
           !/^#/.test(lines[i]) &&
           !(lines[i].includes('|') && i + 1 < N && /\|?\s*:?-{3,}.*\|?.*/.test(lines[i + 1])) &&
           !/^\s*\$\$/.test(lines[i])) {
      plines.push(lines[i]);
      i++;
    }
    const p = applyInline(plines.join(' ').trim());
    if (p) out.push(`<p>${p}</p>`);
  }

  return out.join('\n');
}

// Expose for other scripts (e.g., blog.js)
window.markdownToHtml = renderMarkdown;

function fetchAndRenderMarkdown(mdPath, containerSelector) {
  fetch(mdPath)
    .then(r => r.text())
    .then(md => {
      const html = renderMarkdown(md);
      document.querySelector(containerSelector).innerHTML = html;
    });
}
