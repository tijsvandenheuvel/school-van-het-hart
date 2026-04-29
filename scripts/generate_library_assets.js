#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceCatalogPath = path.join(root, 'wiki/meta/source-catalog.json');
const libraryRoot = path.join(root, 'assets/library');
const pagesRoot = path.join(libraryRoot, 'pages');
const tmpRoot = path.join(root, 'tmp/library-pages');
const catalogPath = path.join(libraryRoot, 'library-catalog.json');

const PDF_SETTINGS = {
  dpi: 180,
  webpQuality: 82
};

const SOURCE_ORDER = [
  'excalibur-bron',
  'boek-der-geruststelling-bron',
  'svhh-basisdoc-bron',
  'svhh-visietekst-bron'
];

const DISPLAY_ROTATION_BY_SLUG = {
  'boek-der-geruststelling-bron': 90
};

const PAGE_ROTATIONS_BY_SLUG = {
  'excalibur-bron': [
    { from: 5, to: 111, rotation: 90 }
  ]
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit' });
}

function capture(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8' });
}

function pdfPageCount(filePath) {
  const output = capture('pdfinfo', [filePath]);
  const match = output.match(/^Pages:\s+(\d+)$/m);
  if (!match) throw new Error(`Kon pagina-aantal niet lezen voor ${filePath}`);
  return Number(match[1]);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/&/g, ' en ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripFrontmatter(markdown) {
  return String(markdown || '').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/u, '').trim();
}

function stripLeadingTitle(markdown, title) {
  const lines = String(markdown || '').replace(/\r/g, '').split('\n');
  if (lines[0] && lines[0].trim().toLowerCase() === `# ${title}`.toLowerCase()) {
    return lines.slice(1).join('\n').trim();
  }
  return markdown.trim();
}

function inlineMarkdownToHtml(text) {
  return escapeHtml(text).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const title = label || target;
    return `<span class="library-article-wikilink">${escapeHtml(title.trim())}</span>`;
  });
}

function markdownToArticle(markdown, title) {
  const source = stripLeadingTitle(stripFrontmatter(markdown), title);
  const lines = source.replace(/\r/g, '').split('\n');
  const html = [];
  const tableOfContents = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    if (!trimmed) {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 4);
      const text = headingMatch[2].trim();
      const id = slugify(text);
      tableOfContents.push({ id, title: text, level });
      html.push(`<h${level} id="${escapeHtml(id)}">${inlineMarkdownToHtml(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${inlineMarkdownToHtml(lines[index].trim().replace(/^[-*]\s+/, ''))}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(`<li>${inlineMarkdownToHtml(lines[index].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate) break;
      if (/^(#{2,4})\s+/.test(candidate) || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate)) {
        break;
      }
      paragraphLines.push(candidate);
      index += 1;
    }
    html.push(`<p>${inlineMarkdownToHtml(paragraphLines.join(' '))}</p>`);
  }

  return {
    articleHtml: html.join('\n'),
    tableOfContents
  };
}

function renderPdfSource(source) {
  const sourceFile = path.join(root, source.sourceFile);
  const pageCount = pdfPageCount(sourceFile);
  const renderDir = path.join(tmpRoot, source.slug);
  const pageDir = path.join(pagesRoot, source.slug);
  const prefix = path.join(renderDir, 'page');

  cleanDir(renderDir);
  cleanDir(pageDir);

  run('pdftoppm', [
    '-r',
    String(PDF_SETTINGS.dpi),
    '-f',
    '1',
    '-l',
    String(pageCount),
    '-png',
    sourceFile,
    prefix
  ]);

  const pngFiles = fs.readdirSync(renderDir)
    .filter((name) => /^page-\d+\.png$/.test(name))
    .sort((left, right) => Number(left.match(/\d+/)[0]) - Number(right.match(/\d+/)[0]));

  if (pngFiles.length !== pageCount) {
    throw new Error(`${source.slug}: verwachtte ${pageCount} renders, kreeg ${pngFiles.length}`);
  }

  pngFiles.forEach((filename, index) => {
    const pageNumber = index + 1;
    const sourcePath = path.join(renderDir, filename);
    const targetPath = path.join(pageDir, `page-${String(pageNumber).padStart(3, '0')}.webp`);
    run('cwebp', [
      '-quiet',
      '-mt',
      '-q',
      String(PDF_SETTINGS.webpQuality),
      sourcePath,
      '-o',
      targetPath
    ]);
  });

  return {
    slug: source.slug,
    title: source.title,
    summary: source.summary,
    kind: 'pdf',
    sourceFile: source.sourceFile,
    pageCount,
    pageBasePath: `./assets/library/pages/${source.slug}`,
    pageExtension: 'webp',
    displayRotation: DISPLAY_ROTATION_BY_SLUG[source.slug] || 0,
    pageRotations: PAGE_ROTATIONS_BY_SLUG[source.slug] || [],
    articleHtml: '',
    tableOfContents: []
  };
}

function renderDocxSource(source) {
  const article = markdownToArticle(source.body, source.title);
  return {
    slug: source.slug,
    title: source.title,
    summary: source.summary,
    kind: 'docx',
    sourceFile: source.sourceFile,
    pageCount: 0,
    pageBasePath: '',
    pageExtension: '',
    displayRotation: 0,
    pageRotations: [],
    articleHtml: article.articleHtml,
    tableOfContents: article.tableOfContents
  };
}

function main() {
  const sourceCatalog = readJson(sourceCatalogPath);
  const sourceEntries = (sourceCatalog.entries || [])
    .filter((entry) => entry.indexType === 'text')
    .filter((entry) => SOURCE_ORDER.includes(entry.slug))
    .sort((left, right) => SOURCE_ORDER.indexOf(left.slug) - SOURCE_ORDER.indexOf(right.slug));

  if (sourceEntries.length !== SOURCE_ORDER.length) {
    const found = new Set(sourceEntries.map((entry) => entry.slug));
    const missing = SOURCE_ORDER.filter((slug) => !found.has(slug));
    throw new Error(`Broncatalogus mist bibliotheekbronnen: ${missing.join(', ')}`);
  }

  ensureDir(libraryRoot);
  ensureDir(pagesRoot);
  ensureDir(tmpRoot);

  const sources = sourceEntries.map((source) => {
    const extension = path.extname(source.sourceFile || '').toLowerCase();
    if (extension === '.pdf') return renderPdfSource(source);
    if (extension === '.docx') return renderDocxSource(source);
    throw new Error(`${source.slug}: niet-ondersteund bibliotheekformaat ${extension}`);
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    settings: PDF_SETTINGS,
    sources
  };

  fs.writeFileSync(catalogPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Library catalog written with ${sources.length} sources.`);
}

main();
