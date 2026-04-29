# UI Guidelines

## Huidige layoutlogica

De homepage werkt nu volgens deze structuur:

1. Grote titel bovenaan: `School van het Hart`
2. Kleine control group linksboven binnen de paginakader: `Wiki`, `Bibliotheek` plus een subtiele frame-toggle zonder zichtbaar label
3. Kleine versieknop rechtsboven, binnen de paginakader
4. Ornamentale sierkader rond de volledige pagina
5. Cirkelcompositie met 12 labels rond een centraal hart
   - de labels staan op een exacte 12-delige geometrische ring
   - achter de kern ligt een subtiele mathematisch gegenereerde flower-of-life laag
6. In de kern staan alleen:
   - `WAT`
   - het hart
   - `HOE`
7. Klik op een label opent de inhoudelijke modal

## Belangrijke designbeslissingen

- De titel staat buiten de cirkel, zodat hij niet interfereert met de kern.
- De titel is tegelijk een rustige trigger voor de volledige visietekst-modal en moet dus leesbaar blijven als klikbaar element.
- De paginakader omvat ook titel en versieknop, dus niet alleen de centrale compositie.
- De paginakader blijft visueel optioneel via een subtiele toggle en mag geen layoutverschuiving veroorzaken wanneer ze uit staat.
- De hoekornamenten komen uit vier aparte SVG-assets zodat hart en lijnwerk niet fout hoeven mee te roteren.
- De frameband leest als een smalle gouden strook met nuance in tint, niet als twee losse dominante lijnen.
- Er staat geen tekst in of over het hart.
- De zichtbare orbit-lijn is verborgen; de zachte glow en subtiele flower-of-life geometrie dragen de cirkel.
- De conceptlabels zijn echte cirkels en volgen een vaste ring met startpunt `-75deg` en stappen van `30deg`.
- De buitenste flower-of-life ring raakt de conceptcirkels aan hun binnenrand; de flower-laag schaalt dus mee met de echte tokenmaat.
- Hover-transforms op conceptcirkels mogen de onderliggende flower-geometrie niet herschalen; gebruik daarvoor layoutmaat, geen getransformeerde visuele maat.
- Het hart staat op hetzelfde geometrische midden als de binnenste flower-of-life cirkel; responsive offsets mogen dat midden niet verschuiven.
- `WAT`-labels hebben een groene tint.
- `HOE`-labels hebben een paarse tint.
- De hartvorm is een zachte rode kern, zonder extra opening of zwart gat.
- De wiki gebruikt de term `Woordenschat` als overkoepelende noemer boven letters, woorden, begrippen, passages, teksten en runtime-afgeleide bronlemma's.
- De bibliotheek is de primaire leeservaring voor bronteksten: PDF's als scanpagina's en Word-bronnen als rustige artikels.

## Responsive regels

Belangrijkste breakpoints:

- `max-width: 980px`
- `max-width: 760px`
- `max-width: 520px`
- `max-height: 760px and min-width: 761px`

Extra afspraak:

- De 12 concepten gebruiken op alle schermen dezelfde exacte geometrische ring.
- Mobiel mag de ring schalen, maar niet terugvallen op losse handmatige compact-hoeken.

## Gevoelige zones

Bij verdere layoutwijzigingen zijn dit de meest gevoelige stukken:

- de onderboog links en rechts
- de spacing tussen `Rainbow`, `Cirkels`, `Zelfbestuur` en `Magic Hat`
- de ruimte tussen top-title en bovenste labels
- de verticale afstand tussen `WAT`, het hart en `HOE`

## Praktische editpunten in code

- Versieknop: `index.html`, element `.version-note`
- Bovenste controls: `index.html`, `.page-controls-start`, `.wiki-note`, `#libraryTrigger` en `.frame-toggle`
- Titellayout: `index.html`, `.page-header` en `.page-title`
- Hoofdcompositie: `index.html`, `.composition`
- Ornamentale frame: `index.html`, `.page-frame`, `.page-frame-band`, `.page-frame-corner` en `assets/ornament-corner-*.svg`
- Responsive regels: `index.html`, media queries
- Geometrische ring: `assets/js/site.js`, `ORBIT_GEOMETRY`
- Conceptdata: `assets/js/site.js`, `const concepts = [...]`
- Flower-of-life laag: `index.html`, `.flower-of-life-layer` en `renderFlowerOfLife()`
- Modalinhoud: `index.html`, `sections`, `renderConceptBody()` en `.modal-copy`
- Bibliotheek: `index.html`, `#libraryModal`, `#sourcePagePreviewModal`, `assets/library/library-catalog.json` en `renderLibrary()`

## Versie-afspraak

- Huidige versie: `v0.3.5`
- Canonieke versiebron: de bovenste entry in `docs/changelog.md`
- De versieknop in `index.html` leest die actuele versie uit de changelog
- Verhoog de versie bij elke echte inhoudelijke, visuele of interactionele voortgang
