# Project Context

## Doel

Deze website is een visuele en inhoudelijke introductie tot het idee van de School van het Hart.

De homepage moet:

- het idee snel leesbaar maken
- de 12 kernconcepten tonen
- een duidelijk midden hebben: `WAT`, het hart, en `HOE`
- ruimte laten voor verdere inhoudelijke verdieping via modals of latere subpagina's

## Technische uitgangssituatie

- Stack: plain `HTML`, `CSS` en `JavaScript`
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

## Werkafspraken

- Werk verder op `index.html` tenzij er later echt meerdere pagina's komen.
- Vermijd opnieuw een tweede losse HTML-variant als concurrerende bron van waarheid.
- `docs/concepts.md` bewaart de canonieke inhoud van de 12 concepten; `index.html` moet die inhoud weerspiegelen.
- De versiebadge rechtsboven volgt echte iteraties.
- Huidige versie is `v0.1.7`.
- De volgende inhoudelijke of visuele iteratie wordt `v0.1.8`.

## Verificatie-afspraak

Na layoutwijzigingen minstens controleren op:

- desktop rond `1440x820`
- mobiel rond `390x844`

## Huidige interactie

- Elk concept is klikbaar.
- Klik opent een modal met titel, korte samenvatting en langere bodytekst.
- De modalbody ondersteunt meerdere secties met tussentitels en alinea's.
- `Escape` sluit de modal.
- Klik buiten de modal sluit ook.
