const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

require(path.join(__dirname, '..', 'assets/js/wiki-core.js'));

const Core = globalThis.SVHHWikiCore;
const ROOT_DIR = path.resolve(__dirname, '..');
const ITEMS_DIR = path.join(ROOT_DIR, 'wiki', 'items');
const CURATED_INDEX_PATH = path.join(ROOT_DIR, 'wiki', 'meta', 'curated-index.md');
const IGNORED_TERMS_PATH = path.join(ROOT_DIR, 'wiki', 'meta', 'ignored-terms.md');
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

function sendText(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    'Content-Type': contentType || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

function relativeRootPath(absolutePath) {
  return path.relative(ROOT_DIR, absolutePath).replace(/\\/g, '/');
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function loadWikiItems() {
  const names = (await fs.readdir(ITEMS_DIR)).filter((name) => name.endsWith('.md')).sort();

  return Promise.all(
    names.map(async (name) => {
      const filePath = path.join(ITEMS_DIR, name);
      const markdown = await fs.readFile(filePath, 'utf8');
      return Core.parseItemMarkdown(markdown, relativeRootPath(filePath));
    })
  );
}

async function readCuratedTargets() {
  const markdown = await fs.readFile(CURATED_INDEX_PATH, 'utf8');
  return {
    markdown,
    targets: Core.parseCuratedIndexMarkdown(markdown)
  };
}

async function readIgnoredTerms() {
  try {
    const markdown = await fs.readFile(IGNORED_TERMS_PATH, 'utf8');
    return markdown
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*-\s+(.*)$/))
      .filter(Boolean)
      .map((match) => match[1].trim())
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function writeIgnoredTerms(terms) {
  const unique = Array.from(new Set((terms || []).map((term) => term.trim()).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'nl')
  );

  const markdown = [
    '# Ignored Terms',
    '',
    'Deze termen worden bewust niet meer als kandidaat voor een nieuw wiki-item getoond.',
    '',
    ...unique.map((term) => `- ${term}`)
  ].join('\n');

  await fs.writeFile(IGNORED_TERMS_PATH, `${markdown}\n`, 'utf8');
}

async function collectCandidateSources() {
  const sources = [];
  const conceptDoc = path.join(ROOT_DIR, 'docs', 'concepts.md');
  const projectContextDoc = path.join(ROOT_DIR, 'docs', 'project-context.md');
  const itemNames = (await fs.readdir(ITEMS_DIR)).filter((name) => name.endsWith('.md')).sort();

  for (const absolutePath of [conceptDoc, projectContextDoc]) {
    sources.push({
      path: relativeRootPath(absolutePath),
      text: await fs.readFile(absolutePath, 'utf8')
    });
  }

  for (const name of itemNames) {
    const absolutePath = path.join(ITEMS_DIR, name);
    sources.push({
      path: relativeRootPath(absolutePath),
      text: await fs.readFile(absolutePath, 'utf8')
    });
  }

  return sources;
}

async function buildWikiState() {
  const items = await loadWikiItems();
  const curated = await readCuratedTargets();
  const ignoredTerms = await readIgnoredTerms();
  const wikiIndex = Core.buildWikiIndex(items, { curatedTargets: curated.targets });
  const candidates = Core.extractTermCandidates(await collectCandidateSources(), wikiIndex, { ignoredTerms });

  return {
    generatedAt: new Date().toISOString(),
    stats: wikiIndex.stats,
    curatedTargets: curated.targets,
    ignoredTerms,
    items: wikiIndex.order.map((slug) => wikiIndex.bySlug[slug]).filter(Boolean),
    brokenLinks: wikiIndex.items
      .filter((item) => item.brokenLinks.length)
      .map((item) => ({
        slug: item.slug,
        title: item.title,
        brokenLinks: item.brokenLinks
      })),
    orphans: wikiIndex.items
      .filter((item) => !item.backlinks.length && !item.resolvedLinks.length)
      .map((item) => ({
        slug: item.slug,
        title: item.title
      })),
    candidates
  };
}

async function updateCuratedIndex(title, previousSlug) {
  const curated = await readCuratedTargets();
  let markdown = curated.markdown;
  let replaced = false;
  const nextSlug = Core.slugify(title);

  if (previousSlug) {
    markdown = markdown.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (rawMatch, rawTarget) => {
      if (replaced || Core.slugify(rawTarget) !== previousSlug) {
        return rawMatch;
      }

      replaced = true;
      return `[[${title}]]`;
    });
  }

  const hasCurrentEntry = Core.parseCuratedIndexMarkdown(markdown).some((target) => Core.slugify(target) === nextSlug);

  if (!replaced && !hasCurrentEntry) {
    markdown = `${markdown.trimEnd()}\n- [[${title}]]\n`;
  }

  await fs.writeFile(CURATED_INDEX_PATH, markdown, 'utf8');
}

async function saveItem(payload) {
  const title = String(payload.title || '').trim();
  const summary = String(payload.summary || '').trim();
  const body = String(payload.body || '').trim();
  const links = Array.isArray(payload.links)
    ? payload.links.map((term) => String(term || '').trim()).filter(Boolean)
    : [];

  if (!title) {
    throw new Error('Een wiki-item heeft minstens een titel nodig.');
  }

  const slug = Core.slugify(title);
  const previousSlug = String(payload.previousSlug || '').trim();
  const nextFilePath = path.join(ITEMS_DIR, `${slug}.md`);
  const previousFilePath = previousSlug ? path.join(ITEMS_DIR, `${previousSlug}.md`) : null;

  if (!previousSlug) {
    try {
      await fs.access(nextFilePath);
      throw new Error(`Een item met slug "${slug}" bestaat al.`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  const markdown = Core.serializeItemMarkdown({ title, summary, links, body });
  await fs.writeFile(nextFilePath, `${markdown.trimEnd()}\n`, 'utf8');

  if (previousFilePath && previousSlug !== slug) {
    try {
      await fs.unlink(previousFilePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  await updateCuratedIndex(title, previousSlug);
  return { slug };
}

async function createItemFromCandidate(term) {
  const title = String(term || '').trim();

  if (!title) {
    throw new Error('Kandidaatterm ontbreekt.');
  }

  const markdown = [
    `# ${title}`,
    '',
    'Nog te beschrijven.',
    '',
    '## Context',
    '',
    'Deze pagina werd aangemaakt vanuit de kandidaatstroom in de wiki-admin.'
  ].join('\n');

  await saveItem({
    title,
    summary: 'Nieuw wiki-item in opbouw.',
    links: [],
    body: markdown
  });
}

async function mergeCandidateIntoItem(term, targetSlug) {
  const items = await loadWikiItems();
  const target = items.find((item) => item.slug === targetSlug);

  if (!target) {
    throw new Error('Doelitem voor merge niet gevonden.');
  }

  const links = Array.from(new Set([...target.links, String(term || '').trim()].filter(Boolean)));
  await saveItem({
    previousSlug: target.slug,
    title: target.title,
    summary: target.summary,
    links,
    body: target.body
  });
}

async function ignoreCandidate(term) {
  const ignoredTerms = await readIgnoredTerms();
  if (!ignoredTerms.includes(term)) {
    ignoredTerms.push(term);
    await writeIgnoredTerms(ignoredTerms);
  }
}

async function serveStaticFile(requestPath, response) {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const absolutePath = path.resolve(ROOT_DIR, `.${normalizedPath}`);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    sendText(response, 403, 'Forbidden');
    return;
  }

  try {
    const fileBuffer = await fs.readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();
    sendText(response, 200, fileBuffer, MIME_TYPES[extension] || 'application/octet-stream');
  } catch (error) {
    sendText(response, 404, 'Not found');
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${PORT}`);

  try {
    if (request.method === 'GET' && url.pathname === '/api/wiki/index') {
      sendJson(response, 200, await buildWikiState());
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/wiki/item') {
      const payload = await readRequestBody(request);
      const result = await saveItem(payload);
      sendJson(response, 200, { ok: true, ...result });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/wiki/candidates/create') {
      const payload = await readRequestBody(request);
      await createItemFromCandidate(payload.term);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/wiki/candidates/merge') {
      const payload = await readRequestBody(request);
      await mergeCandidateIntoItem(payload.term, payload.targetSlug);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/wiki/candidates/ignore') {
      const payload = await readRequestBody(request);
      await ignoreCandidate(payload.term);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'GET' && (url.pathname === '/admin/wiki' || url.pathname === '/admin/wiki/')) {
      await serveStaticFile('/admin/wiki.html', response);
      return;
    }

    if (request.method === 'GET') {
      await serveStaticFile(url.pathname, response);
      return;
    }

    sendText(response, 405, 'Method not allowed');
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || 'Onbekende serverfout'
    });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`School van het Hart wiki server draait op http://127.0.0.1:${PORT}`);
});
