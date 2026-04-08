# UI Guidelines

## Huidige layoutlogica

De homepage werkt nu volgens deze structuur:

1. Grote titel bovenaan: `School van het Hart`
2. Kleine versieknop rechtsboven, binnen de paginakader
3. Ornamentale sierkader rond de volledige pagina
4. Cirkelcompositie met 12 labels rond een centraal hart
5. In de kern staan alleen:
   - `WAT`
   - het hart
   - `HOE`
6. Klik op een label opent de inhoudelijke modal

## Belangrijke designbeslissingen

- De titel staat buiten de cirkel, zodat hij niet interfereert met de kern.
- De paginakader omvat ook titel en versieknop, dus niet alleen de centrale compositie.
- De hoekornamenten komen uit vier aparte SVG-assets zodat hart en lijnwerk niet fout hoeven mee te roteren.
- De frameband leest als een smalle gouden strook met nuance in tint, niet als twee losse dominante lijnen.
- Er staat geen tekst in of over het hart.
- De zichtbare orbit-lijn is verborgen; enkel de zachte glow blijft.
- `WAT`-labels hebben een groene tint.
- `HOE`-labels hebben een paarse tint.
- De hartvorm is een zachte rode kern, zonder extra opening of zwart gat.

## Responsive regels

Belangrijkste breakpoints:

- `max-width: 980px`
- `max-width: 760px`
- `max-width: 520px`
- `max-height: 760px and min-width: 761px`

Extra afspraak:

- Voor extra smalle schermen wordt `angleMobile` gebruikt wanneer die bestaat.
- Dat gebeurt via JavaScript met `matchMedia('(max-width: 520px)')`.

## Gevoelige zones

Bij verdere layoutwijzigingen zijn dit de meest gevoelige stukken:

- de onderboog links en rechts
- de spacing tussen `Rainbow`, `Cirkels`, `Zelfbestuur` en `Magic Hat`
- de ruimte tussen top-title en bovenste labels
- de verticale afstand tussen `WAT`, het hart en `HOE`

## Praktische editpunten in code

- Versieknop: `index.html`, element `.version-note`
- Titellayout: `index.html`, `.page-header` en `.page-title`
- Hoofdcompositie: `index.html`, `.composition`
- Ornamentale frame: `index.html`, `.page-frame`, `.page-frame-band`, `.page-frame-corner` en `assets/ornament-corner-*.svg`
- Responsive regels: `index.html`, media queries
- Labelhoeken: `index.html`, `const concepts = [...]`
- Compact mobile hoeken: `index.html`, `angleMobile` en `syncTokenAngles()`
- Modalinhoud: `index.html`, `sections`, `renderModalBody()` en `.modal-copy`

## Versie-afspraak

- Huidige versie: `v0.2.12`
- Canonieke versiebron: de bovenste entry in `docs/changelog.md`
- De versieknop in `index.html` leest die actuele versie uit de changelog
- Verhoog de versie bij elke echte inhoudelijke, visuele of interactionele voortgang
