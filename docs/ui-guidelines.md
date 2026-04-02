# UI Guidelines

## Huidige layoutlogica

De homepage werkt nu volgens deze structuur:

1. Grote titel bovenaan: `School van het Hart`
2. Kleine versiebadge rechtsboven
3. Cirkelcompositie met 12 labels rond een centraal hart
4. In de kern staan alleen:
   - `WAT`
   - het hart
   - `HOE`
5. Klik op een label opent de inhoudelijke modal

## Belangrijke designbeslissingen

- De titel staat buiten de cirkel, zodat hij niet interfereert met de kern.
- Er staat geen tekst in of over het hart.
- De zichtbare orbit-lijn is verborgen; enkel de zachte glow blijft.
- `WAT`-labels hebben een groene tint.
- `HOE`-labels hebben een paarse tint.
- De hartvorm is een zachte rode kern, zonder extra opening of zwart gat.

## Responsive regels

Belangrijkste breakpoints:

- `max-width: 980px`
- `max-width: 760px`
- `max-width: 420px`
- `max-height: 760px and min-width: 761px`

Extra afspraak:

- Voor extra smalle schermen wordt `angleMobile` gebruikt wanneer die bestaat.
- Dat gebeurt via JavaScript met `matchMedia('(max-width: 420px)')`.

## Gevoelige zones

Bij verdere layoutwijzigingen zijn dit de meest gevoelige stukken:

- de onderboog links en rechts
- de spacing tussen `Rainbow`, `Cirkels`, `Zelfbestuur` en `Magic Hat`
- de ruimte tussen top-title en bovenste labels
- de verticale afstand tussen `WAT`, het hart en `HOE`

## Praktische editpunten in code

- Versiebadge: `index.html`, element `.version-note`
- Titellayout: `index.html`, `.page-header` en `.page-title`
- Hoofdcompositie: `index.html`, `.composition`
- Responsive regels: `index.html`, media queries
- Labelhoeken: `index.html`, `const concepts = [...]`
- Compact mobile hoeken: `index.html`, `angleMobile` en `syncTokenAngles()`

## Versie-afspraak

- Huidige versie: `v0.1.6`
- Volgende iteratie: `v0.1.7`
- Verhoog de versiebadge enkel bij echte inhoudelijke of visuele voortgang
