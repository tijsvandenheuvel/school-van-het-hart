# Project Context

## Doel

Deze website is een visuele en inhoudelijke introductie tot het idee van de School van het Hart.

De homepage moet:

- het idee snel leesbaar maken
- de 12 kernconcepten tonen
- een duidelijk midden hebben: `WAT`, het hart, en `HOE`
- ruimte laten voor verdere inhoudelijke verdieping via modals of latere subpagina's

## Technische uitgangssituatie

- Stack: plain `HTML`, `CSS` en `JavaScript`, plus een kleine lokale Node-server voor de wiki-admin
- Geen buildstap
- Actieve homepage: `index.html`
- Custom domain via `CNAME`: `schoolvanhethart.be`

## Repo-structuur

- `index.html`
  De huidige homepage en de enige actieve frontend-entrypoint.

- `CNAME`
  Het custom domain voor publicatie.

- `docs/`
  Documentatie voor inhoud, layout en vervolgwerk.

- `wiki/`
  De canonieke markdown-bronnen voor de wiki-laag en de meta-bestanden voor index en ignore-lijst.

- `admin/wiki.html`
  Lokale adminmode voor wiki-items, preview en relationele curation.

- `server/wiki-server.js`
  Kleine lokale server voor statische serving en markdown-gebaseerde wiki-API's.

## Werkafspraken

- Werk verder op `index.html` tenzij er later echt meerdere pagina's komen.
- Vermijd opnieuw een tweede losse HTML-variant als concurrerende bron van waarheid.
- `docs/concepts.md` bewaart de canonieke inhoud van de 12 concepten; `index.html` moet die inhoud weerspiegelen.
- `docs/changelog.md` bewaart de canonieke versiegeschiedenis; de bovenste entry bepaalt de actuele siteversie.
- De versieknop rechtsboven en de changelog-modal in `index.html` lezen die changelog-inhoud in.
- Huidige versie is `v0.2.16`.
- Elke inhoudelijke, visuele of interactionele iteratie krijgt meteen een nieuwe changelog-entry.

## Verificatie-afspraak

Na layoutwijzigingen minstens controleren op:

- desktop rond `1440x820`
- mobiel rond `390x844`

## Huidige interactie

- Elk concept is klikbaar.
- Klik opent een modal met titel, korte samenvatting en langere bodytekst.
- De modalbody ondersteunt meerdere secties met tussentitels en alinea's.
- Klik op de paginatitel `School van het Hart` opent een aparte modal met de volledige visietekst uit `docs/visietekst.md`.
- Klik op de versieknop rechtsboven opent een changelog-modal met de recente wijzigingen.
- Klik op de `Wiki`-knop opent een publieke markdown-wiki-modal met een A-Z woordenboekindex, zoekveld, backlinks en uitgaande links.
- Begrippen in conceptteksten, visietekst en wiki-artikelen linken door naar dezelfde wiki-itemweergave.
- De subtiele frame-toggle naast `Wiki` zet de ornamentale rand lokaal aan of uit en bewaart die voorkeur in de browser.
- `Escape` sluit de modal.
- Klik buiten de modal sluit ook.
