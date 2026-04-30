const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const siteJs = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');
const wikiCss = fs.readFileSync(path.join(root, 'assets/css/wiki.css'), 'utf8');
const changelog = fs.readFileSync(path.join(root, 'docs/changelog.md'), 'utf8');

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label} mist: ${expected}`);
  }
}

function assertMatch(source, pattern, label) {
  if (!pattern.test(source)) {
    throw new Error(`${label} mist patroon: ${pattern}`);
  }
}

[
  ['homeTrigger', 'header home-trigger'],
  ['home-note', 'grotere homeknop'],
  ['alphabetTrigger', 'header letters-trigger'],
  ['libraryTrigger', 'header bibliotheek-trigger'],
  ['wikiTrigger', 'header alles-trigger'],
  ['alphabetModal', 'alfabetmodal'],
  ['alphabetCircle', 'alfabetcirkel'],
  ['alphabetReader', 'alfabetreader']
].forEach(([expected, label]) => assertIncludes(indexHtml, expected, label));

[
  ['openAlphabetModal', 'alfabetmodal openfunctie'],
  ['renderAlphabetCircle', 'alfabetcirkel renderer'],
  ['openWordsModal', 'woordenmodal openfunctie'],
  ['openCollectionTarget', 'gedeelde collectienavigatie'],
  ['data-collection-target', 'gedeelde collectienav events'],
  ['wiki-status-summary', 'enkelvoudige wiki-status zonder dubbele navigatie']
].forEach(([expected, label]) => assertIncludes(siteJs, expected, label));

[
  ['.collection-nav', 'gedeelde modalnavigatie'],
  ['.alphabet-circle', 'alfabetcirkel styling'],
  ['.alphabet-letter-node', 'letterknop styling']
].forEach(([expected, label]) => assertIncludes(wikiCss, expected, label));

assertMatch(indexHtml, /<button[^>]+id="homeTrigger"[\s\S]*?>School van het Hart<\/button>[\s\S]*?<button[^>]+id="alphabetTrigger"[\s\S]*?>Alfabet<\/button>[\s\S]*?<button[^>]+id="wikiTrigger"[\s\S]*?>Wiki<\/button>[\s\S]*?<button[^>]+id="libraryTrigger"[\s\S]*?>Bibliotheek<\/button>/, 'hoofdnavigatie toont School van het Hart/Alfabet/Wiki/Bibliotheek');
if (indexHtml.includes('id="wordsTrigger"')) {
  throw new Error('hoofdnavigatie bevat nog een aparte Woorden-knop');
}
assertIncludes(indexHtml, 'page-header" aria-hidden="true"', 'achtergrondtitel is verborgen');
assertIncludes(indexHtml, '--version-frame-gap', 'versieknop gebruikt expliciete kaderafstand');
assertIncludes(indexHtml, '--header-frame-gap', 'headerknoppen gebruiken expliciete kaderafstand');
assertIncludes(indexHtml, '--composition-header-safe', 'compositie reserveert ruimte onder de header');
assertMatch(indexHtml, /\.page\s*\{[\s\S]*?align-items:\s*center/, 'pagina centreert de compositie verticaal');
if (indexHtml.includes('calc(100vh - 190px)')) {
  throw new Error('oude compositiehoogte calc(100vh - 190px) is teruggekeerd');
}
assertIncludes(indexHtml, 'v0.3.19', 'index-versie');
assertMatch(changelog, /^## v0\.3\.19 - /m, 'changelog v0.3.19');

console.log('Collectienavigatie-verificatie geslaagd.');
