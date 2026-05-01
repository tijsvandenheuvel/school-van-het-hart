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

function assertDoesNotMatch(source, pattern, label) {
  if (pattern.test(source)) {
    throw new Error(`${label} bevat onverwacht patroon: ${pattern}`);
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
  ['alphabetReader', 'alfabetreader'],
  ['alphabetSearchInput', 'alfabetzoekbalk'],
  ['alphabetForwardBtn', 'alfabet volgende-knop'],
  ['alphabetDirectoryToggleBtn', 'alfabet lijstknop'],
  ['librarySearchInput', 'bibliotheekzoekbalk'],
  ['libraryBackBtn', 'bibliotheek vorige-knop'],
  ['libraryForwardBtn', 'bibliotheek volgende-knop']
].forEach(([expected, label]) => assertIncludes(indexHtml, expected, label));

[
  ['openAlphabetModal', 'alfabetmodal openfunctie'],
  ['renderAlphabetCircle', 'alfabetcirkel renderer'],
  ['openWordsModal', 'woordenmodal openfunctie'],
  ['openCollectionTarget', 'gedeelde collectienavigatie'],
  ['data-collection-target', 'gedeelde collectienav events'],
  ['renderWikiStatus', 'wiki-status renderer blijft bestaan zonder headerchip'],
  ['updateChangelogCount', 'changelogteller renderer']
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
assertIncludes(indexHtml, '.changelog-count', 'changelogteller styling');
assertIncludes(indexHtml, 'id="changelogCount"', 'changelogteller staat in de modalheader');
assertMatch(indexHtml, /<div class="changelog-header-actions">[\s\S]*?id="changelogCount"[\s\S]*?id="closeChangelogBtn"/, 'changelogteller staat links naast de sluitknop');
assertMatch(siteJs, /entryCount\s*\+=\s*1/, 'changelogparser telt release entries');
assertDoesNotMatch(siteJs, /changeCount\s*\+=\s*1/, 'changelogparser telt niet langer losse bullets als tellerwaarde');
assertMatch(siteJs, /updateChangelogCount\(parsed\.entryCount\)/, 'changelogteller gebruikt het aantal releases');
assertMatch(siteJs, /changelogBody\.replaceChildren\(parsed\.fragment\)/, 'changelogteller staat niet langer in de scrollende modalinhoud');
assertMatch(wikiCss, /\.library-modal,\s*\n\.source-preview-modal\s*\{[\s\S]*?background:\s*rgba\(232,\s*240,\s*244,\s*0\.46\)/, 'tekstenmodal gebruikt dezelfde backdrop als de andere viewmodals');
assertMatch(wikiCss, /\.wiki-shell\s*\{[\s\S]*?width:\s*min\(1280px,\s*100%\)[\s\S]*?height:\s*min\(92vh,\s*940px\)[\s\S]*?border-radius:\s*34px[\s\S]*?background:\s*rgba\(255,255,255,0\.95\)/, 'wiki-shell gebruikt de gedeelde viewmodalmaat, ronding en achtergrond');
assertMatch(wikiCss, /\.library-shell\s*\{[\s\S]*?width:\s*min\(1280px,\s*100%\)[\s\S]*?height:\s*min\(92vh,\s*940px\)[\s\S]*?border-radius:\s*34px[\s\S]*?background:\s*rgba\(255,255,255,0\.95\)/, 'tekstenmodal gebruikt dezelfde viewmodalmaat, ronding en achtergrond');
assertMatch(wikiCss, /\.wiki-toolbar,\s*\n\.library-toolbar\s*\{[\s\S]*?grid-template-columns:\s*auto minmax\(160px,\s*520px\) auto auto/, 'modaltoolbars gebruiken dezelfde vier-koloms desktopgrid zolang alles naast elkaar past');
assertMatch(wikiCss, /\.wiki-toolbar-history\s*\{[\s\S]*?grid-column:\s*1[\s\S]*?justify-self:\s*start/, 'vorige/volgende staan links in dezelfde toolbarpositie');
assertMatch(wikiCss, /\.wiki-toolbar-search\s*\{[\s\S]*?grid-column:\s*2[\s\S]*?width:\s*100%/, 'zoekbalk staat op desktop in de tweede kolom met vaste maximale gridbreedte');
assertMatch(wikiCss, /\.wiki-toolbar > \.collection-nav,\s*\n\.library-toolbar > \.collection-nav\s*\{[\s\S]*?grid-column:\s*3[\s\S]*?grid-row:\s*1[\s\S]*?justify-self:\s*center/, 'collectienavigatie staat centraal naast de zoekbalk op desktop');
assertMatch(wikiCss, /\.collection-nav\s*\{[\s\S]*?min-width:\s*max-content/, 'collectienavigatie behoudt haar inhoudsbreedte en schuift niet over zoekbalk of acties');
assertMatch(wikiCss, /\.wiki-toolbar-actions\s*\{[\s\S]*?grid-column:\s*4[\s\S]*?justify-self:\s*end/, 'lijsttoggle en sluitknop staan rechts in dezelfde toolbarpositie');
assertMatch(wikiCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.wiki-content\s*\{[\s\S]*?grid-template-columns:\s*1fr[\s\S]*?\.wiki-toolbar,\s*\n\s*\.library-toolbar\s*\{[\s\S]*?grid-template-rows:\s*auto auto[\s\S]*?\.wiki-toolbar > \.collection-nav,[\s\S]*?grid-row:\s*2[\s\S]*?justify-self:\s*center/, 'lijstlayout en collectienavigatie schakelen op hetzelfde compacte breakpoint');
assertDoesNotMatch(wikiCss, /\.alphabet-toolbar\s*\{[\s\S]*?grid-template-columns:/, 'alfabettoolbar mag geen afwijkende collectienav-grid meer hebben');
assertDoesNotMatch(indexHtml, /class="alphabet-toolbar-title"/, 'alfabetheader heeft geen zichtbare titelcontainer meer');
assertIncludes(indexHtml, '<span id="alphabetTitle" hidden>Letters</span>', 'alfabettitel blijft enkel verborgen beschikbaar voor logica');
assertDoesNotMatch(wikiCss, /@media \(max-width:\s*760px\)[\s\S]*?\.collection-nav-btn\s*\{[^}]*font-size:/, 'collectienav-tekst wordt mobiel niet kleiner gemaakt');
if (siteJs.includes("status.className = 'wiki-status-summary'")) {
  throw new Error('wiki-status toont opnieuw knopachtige tellers in de header');
}
if (siteJs.includes('wikiStatus.appendChild(status)')) {
  throw new Error('wiki-status voegt opnieuw een tellerchip toe aan de header');
}
if (indexHtml.includes('calc(100vh - 190px)')) {
  throw new Error('oude compositiehoogte calc(100vh - 190px) is teruggekeerd');
}
assertIncludes(indexHtml, 'v0.3.31', 'index-versie');
assertMatch(changelog, /^## v0\.3\.31 - /m, 'changelog v0.3.31');

console.log('Collectienavigatie-verificatie geslaagd.');
