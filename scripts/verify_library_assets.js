#!/usr/bin/env node

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceCatalogPath = path.join(root, 'wiki/meta/source-catalog.json');
const libraryCatalogPath = path.join(root, 'assets/library/library-catalog.json');
const siteJsPath = path.join(root, 'assets/js/site.js');
const htmlPath = path.join(root, 'index.html');

const expectedSources = new Map([
  ['svhh-basisdoc-bron', { kind: 'docx' }],
  ['svhh-visietekst-bron', { kind: 'docx' }],
  ['excalibur-bron', { kind: 'pdf', rotation: 0, pageRotations: [{ from: 5, to: 111, rotation: 90 }] }],
  ['boek-der-geruststelling-bron', { kind: 'pdf', rotation: 90 }]
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pdfPageCount(filePath) {
  const output = execFileSync('pdfinfo', [filePath], { cwd: root, encoding: 'utf8' });
  const match = output.match(/^Pages:\s+(\d+)$/m);
  assert.ok(match, `Cannot read PDF page count for ${filePath}`);
  return Number(match[1]);
}

function assertWebp(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert.ok(buffer.length > 12, `${filePath} is empty or too small`);
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF', `${filePath} is not a RIFF container`);
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP', `${filePath} is not a WebP file`);
}

function expectedPageFilename(pageNumber) {
  return `page-${String(pageNumber).padStart(3, '0')}.webp`;
}

assert.ok(fs.existsSync(sourceCatalogPath), 'wiki/meta/source-catalog.json is missing');
assert.ok(fs.existsSync(libraryCatalogPath), 'assets/library/library-catalog.json is missing');

const sourceCatalog = readJson(sourceCatalogPath);
const sourceTexts = new Map(
  (sourceCatalog.entries || [])
    .filter((entry) => entry.indexType === 'text')
    .map((entry) => [entry.slug, entry])
);

for (const slug of expectedSources.keys()) {
  assert.ok(sourceTexts.has(slug), `Source catalog is missing ${slug}`);
}

const libraryCatalog = readJson(libraryCatalogPath);
assert.ok(Array.isArray(libraryCatalog.sources), 'library-catalog.json must contain a sources array');
assert.equal(libraryCatalog.sources.length, expectedSources.size, 'library catalog should expose the 4 current sources');

const librarySources = new Map(libraryCatalog.sources.map((source) => [source.slug, source]));

for (const [slug, expected] of expectedSources.entries()) {
  const source = librarySources.get(slug);
  const sourceText = sourceTexts.get(slug);
  assert.ok(source, `library catalog is missing ${slug}`);
  assert.equal(source.title, sourceText.title, `${slug} title must match source catalog`);
  assert.equal(source.summary, sourceText.summary, `${slug} summary must match source catalog`);
  assert.equal(source.kind, expected.kind, `${slug} has wrong kind`);

  if (expected.kind === 'pdf') {
    const sourceFile = path.join(root, sourceText.sourceFile);
    const count = pdfPageCount(sourceFile);
    assert.equal(source.pageCount, count, `${slug} pageCount must match PDF`);
    assert.equal(source.displayRotation, expected.rotation, `${slug} displayRotation is wrong`);
    if (expected.pageRotations) {
      assert.deepEqual(source.pageRotations, expected.pageRotations, `${slug} pageRotations are wrong`);
    } else {
      assert.deepEqual(source.pageRotations || [], [], `${slug} should not define pageRotations`);
    }
    assert.ok(source.pageBasePath.endsWith(`/pages/${slug}`), `${slug} pageBasePath should point to its page directory`);

    const pageDir = path.join(root, 'assets/library/pages', slug);
    assert.ok(fs.existsSync(pageDir), `${slug} page directory is missing`);
    const pageFiles = fs.readdirSync(pageDir).filter((name) => name.endsWith('.webp')).sort();
    assert.equal(pageFiles.length, count, `${slug} should have one WebP per PDF page`);

    for (let page = 1; page <= count; page += 1) {
      const expectedFile = expectedPageFilename(page);
      assert.equal(pageFiles[page - 1], expectedFile, `${slug} has unexpected filename at page ${page}`);
      assertWebp(path.join(pageDir, expectedFile));
    }
  } else {
    assert.ok(source.articleHtml && source.articleHtml.length > 500, `${slug} must include readable articleHtml`);
    assert.ok(Array.isArray(source.tableOfContents), `${slug} must include a tableOfContents array`);
    assert.equal(source.pageCount, 0, `${slug} docx source should not expose scan pages`);
  }
}

const siteJs = fs.readFileSync(siteJsPath, 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');
const wikiCss = fs.readFileSync(path.join(root, 'assets/css/wiki.css'), 'utf8');

function extractMediaBlock(css, maxWidth) {
  const marker = `@media (max-width: ${maxWidth}px)`;
  const start = css.indexOf(marker);
  assert.notEqual(start, -1, `Missing ${marker} block`);
  const open = css.indexOf('{', start);
  assert.notEqual(open, -1, `Missing opening brace for ${marker}`);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  throw new Error(`Missing closing brace for ${marker}`);
}

const tabletCss = extractMediaBlock(wikiCss, 980);
const mobileCss = extractMediaBlock(wikiCss, 760);

assert.match(siteJs, /function\s+openSourcePagePreview\s*\(/, 'openSourcePagePreview entrypoint is missing');
assert.match(siteJs, /function\s+openLibraryModal\s*\(/, 'openLibraryModal entrypoint is missing');
assert.match(siteJs, /function\s+getLibraryPageRotation\s*\(/, 'page-specific library rotation helper is missing');
assert.match(siteJs, /libraryState\.currentPage\s*=\s*source\.kind === 'pdf' \? 1 : 1/, 'switching library sources should reset to page 1');
assert.match(siteJs, /resetReaderScroll:\s*shouldResetReaderScroll/, 'switching library sources should reset reader scroll');
assert.match(siteJs, /libraryReader\.scrollTop\s*=\s*0/, 'library reader should scroll to top after source changes');
assert.match(siteJs, /function\s+setLibrarySourcesCollapsed\s*\(/, 'library source list collapse helper is missing');
assert.match(siteJs, /svhh-library-sources-collapsed-v1/, 'library source list collapse preference should be persisted');
assert.match(siteJs, /zoom:\s*1/, 'library zoom state is missing');
assert.match(siteJs, /function\s+setLibraryZoom\s*\(/, 'library zoom helper is missing');
assert.match(siteJs, /function\s+sizeZoomedRotatedPage\s*\(/, 'zoomed rotated page sizing helper is missing');
assert.match(siteJs, /libraryZoomMax\s*=\s*2\.5/, 'library zoom maximum should be explicit');
assert.match(siteJs, /className\s*=\s*'library-page-jump-input'/, 'direct page jump input is missing');
assert.match(siteJs, /jumpInput\.type\s*=\s*'text'/, 'page jump input should avoid browser number spinners');
assert.match(siteJs, /jumpInput\.addEventListener\('input'/, 'page jump input should navigate when the number changes');
assert.doesNotMatch(siteJs, /library-page-jump-btn/, 'page jump should not include a separate Go button');
assert.match(siteJs, /library-page-turn-btn/, 'desktop page turn controls should be rendered next to the scan page');
assert.match(siteJs, /library-page-toolbar-btn/, 'mobile page turn controls should be rendered in the toolbar');
assert.match(siteJs, /library-zoom-controls/, 'library zoom controls should be rendered for PDF sources');
assert.match(siteJs, /library-page-zoom-frame/, 'library zoom frame is missing');
assert.match(siteJs, /library-page-rotated-frame/, 'rotated zoom frame is missing');
assert.match(siteJs, /function\s+startLibrarySwipe\s*\(/, 'mobile swipe start handler is missing');
assert.match(siteJs, /function\s+finishLibrarySwipe\s*\(/, 'mobile swipe finish handler is missing');
assert.match(siteJs, /--library-page-rotation/, 'rotated page images should use the centered rotation CSS variable');
assert.match(siteJs, /\[\[source-page:/, 'source-page wikilink syntax is not handled');
assert.match(html, /id="libraryTrigger"/, 'Bibliotheek trigger is missing');
assert.match(html, /id="libraryModal"/, 'Library modal is missing');
assert.match(html, /id="librarySourceToggleBtn"/, 'Library source list collapse button is missing');
assert.match(html, /id="librarySecondaryToolbar"/, 'Library secondary toolbar is missing');
assert.match(html, /class="[^"]*library-toolbar-close[^"]*"[^>]*id="libraryCloseBtn"/, 'Library close button should have a library-specific toolbar class');
assert.match(html, /id="libraryContent"/, 'Library content shell is missing');
assert.doesNotMatch(html, /Schoolbibliotheek/, 'Texts modal header should not show the Schoolbibliotheek kicker');
assert.doesNotMatch(html, /id="libraryTitle"/, 'Texts modal header should not show the selected source title');
assert.match(html, /id="sourcePagePreviewModal"/, 'Source page preview modal is missing');
assert.match(siteJs, /library-source-list-heading/, 'library source list should render a list heading');
assert.match(siteJs, /headingTitle\.textContent\s*=\s*'Bibliotheek'/, 'library list heading should be Bibliotheek');
assert.doesNotMatch(siteJs, /libraryTitle\.textContent/, 'selected library title should not be mirrored into the header');
assert.match(wikiCss, /\.library-content\.is-source-list-collapsed/, 'library source list collapsed layout is missing');
assert.match(wikiCss, /\.library-secondary-toolbar/, 'library secondary toolbar styling is missing');
assert.match(wikiCss, /\.library-source-list-heading/, 'library list heading styling is missing');
assert.match(wikiCss, /\.library-page-turn-btn/, 'library page turn controls should have dedicated styling');
assert.match(wikiCss, /\.library-page-toolbar-btn\s*\{[\s\S]*?display:\s*none/, 'toolbar page turn controls should be hidden by default');
assert.match(wikiCss, /\.library-zoom-controls\s*\{[\s\S]*?display:\s*inline-flex/, 'desktop/tablet zoom controls should be visible by default');
assert.match(wikiCss, /\.library-page-image-wrap\.is-zoomed\s*\{[\s\S]*?align-items:\s*start[\s\S]*?justify-items:\s*start/, 'zoomed page image wrapper should allow top-left scrollable inspection');
assert.match(wikiCss, /\.library-page-zoom-frame\s*\{[\s\S]*?position:\s*relative/, 'zoom frame should anchor rotated pages');
assert.match(wikiCss, /\.library-page-image-wrap\.is-zoomed \.library-page-zoom-frame\s*\{[\s\S]*?place-items:\s*start start/, 'zoomed pages should anchor the scrollable canvas at the top-left');
assert.match(wikiCss, /\.library-page-rotated-frame\s*\{[\s\S]*?position:\s*relative/, 'rotated zoom frame should create a scrollable page box');
assert.match(wikiCss, /\.library-page-image-wrap\.is-zoomed \.library-page-image\.is-rotated\s*\{[\s\S]*?transform-origin:\s*top left/, 'zoomed rotated pages should anchor from the top-left corner');
assert.match(wikiCss, /touch-action:\s*pan-y pinch-zoom/, 'library reader should allow mobile pinch zoom gestures');
assert.match(mobileCss, /\.library-page-turn-btn\s*\{[\s\S]*?display:\s*none/, 'mobile layout should hide desktop page turn buttons for swipe reading');
assert.match(mobileCss, /\.library-page-toolbar-btn\s*\{[\s\S]*?display:\s*inline-block/, 'mobile layout should show compact toolbar page turn buttons');
assert.match(mobileCss, /\.library-zoom-controls\s*\{[\s\S]*?display:\s*none/, 'mobile layout should leave zoom to native gestures');
assert.match(wikiCss, /\.library-shell\s*\{[\s\S]*?grid-template-columns:\s*minmax\(240px,\s*300px\) minmax\(0,\s*1fr\)/, 'library shell should own the two-column text grid');
assert.match(wikiCss, /\.library-secondary-toolbar\s*\{[\s\S]*?grid-column:\s*2[\s\S]*?grid-row:\s*2/, 'library controls should live above the reader in the right column');
assert.match(wikiCss, /\.library-source-list\s*\{[\s\S]*?grid-column:\s*1[\s\S]*?grid-row:\s*2\s*\/\s*4/, 'library list should span the nav and reader rows');
assert.match(wikiCss, /\.library-reader\s*\{[\s\S]*?grid-column:\s*2[\s\S]*?grid-row:\s*3/, 'library reader should sit below the secondary nav in the right column');
assert.match(wikiCss, /\.library-page-controls\s*\{[\s\S]*?justify-content:\s*center/, 'library page controls should be centered in the reader column');
assert.doesNotMatch(tabletCss, /\.library-page-controls\s*\{[^}]*grid-row:\s*2/, 'tablet library page controls should no longer live in the primary toolbar');
assert.doesNotMatch(mobileCss, /\.library-page-controls\s*\{[^}]*grid-row:\s*3/, 'mobile library page controls should no longer stack inside the primary toolbar');
assert.match(wikiCss, /\.library-page-stage\s*\{[\s\S]*?height:\s*100%/, 'library page stage must use the reader height as sizing boundary');
assert.match(wikiCss, /\.library-page-image-wrap\s*\{[\s\S]*?height:\s*100%/, 'library page image wrapper must be height-constrained');
assert.match(wikiCss, /\.library-page-image\s*\{[\s\S]*?max-height:\s*100%/, 'vertical library pages must fit inside the modal reader');
assert.match(wikiCss, /\.library-page-image\.is-rotated\s*\{[\s\S]*?position:\s*absolute[\s\S]*?translate\(-50%,\s*-50%\)/, 'rotated pages must stay centered in the reader');

console.log('Library assets verified.');
