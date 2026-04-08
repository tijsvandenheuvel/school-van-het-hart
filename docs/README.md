# Docs

Laatst bijgewerkt: 2026-04-07

Huidige siteversie: `v0.2.12`

Actieve entrypoint: `index.html`

Domein: `schoolvanhethart.be`

## Wat staat hier

- `project-context.md`
  Korte samenvatting van doel, stack, repo-structuur en werkafspraken.

- `concepts.md`
  De canonieke inhoud van de 12 concepten die op de homepage rond het hart staan, inclusief de langere modalteksten.

- `../wiki/`
  Canonieke markdown-bronnen voor de wiki-items en de ondersteunende meta-bestanden.

- `../admin/wiki.html`
  De lokale admininterface voor items, editor/preview en relationele curation.

- `../server/wiki-server.js`
  Kleine Node-server die de site en `/admin/wiki` lokaal serveert en markdown direct leest/schrijft.

- `ui-guidelines.md`
  De huidige layoutregels, versie-afspraken en responsive aandachtspunten.

- `changelog.md`
  Canonieke versiegeschiedenis van de iteraties uit deze thread. De bovenste entry bepaalt ook de versieknop op de site.

- `../AGENTS.md`
  Verplichte werkwijze voor changelog-, versie- en documentatiesync bij elke wijziging.

- `next-steps.md`
  Praktische punten voor de volgende werkfases.

## Belangrijk voor verder werk

- Bewerk de homepage verder in `index.html`.
- Gebruik geen extra varianten zoals `index_V2.html` als aparte parallelle waarheid.
- Voeg bij elke wijziging eerst een nieuwe entry toe aan `docs/changelog.md`.
- Houd expliciete versievermeldingen synchroon met echte visuele of inhoudelijke iteraties.
- Controleer layoutwijzigingen minstens op desktop en mobiel.
