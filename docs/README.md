# Docs

Laatst bijgewerkt: 2026-04-24

Huidige siteversie: `v0.3.9`

Actieve entrypoint: `index.html`

Domein: `schoolvanhethart.be`

## Wat staat hier

- `project-context.md`
  Korte samenvatting van doel, stack, repo-structuur en werkafspraken.

- `concepts.md`
  De canonieke inhoud van de 12 concepten die op de homepage rond het hart staan, inclusief de langere modalteksten.

- `visietekst.md`
  De volledige School van het Hart-visietekst als markdownbron voor de aparte titelmodal op de homepage.

- `taalbewustzijn.md`
  De projectbrede taalafspraken voor helder Nederlands, brontrouw en de assimilatie van letters, woorden, begrippen en passages.

- `../wiki/items/`
  Canonieke markdown-wiki-items met frontmatter, beschrijving en interne wikilinks.

- `../wiki/sources/`
  Door de bronpipeline afgeleide markdownversies van bronbestanden die rechtstreeks leesbaar en doorzoekbaar blijven op de site.

- `../wiki/meta/curated-index.md`
  De markdown-index van de canonieke wiki-items; de publieke woordenboekindex verrijkt die lijst verder met alle aliassen uit frontmatter.

- `../wiki/meta/source-catalog.json`
  De gegenereerde broncatalogus met letters, passages en bronteksten voor de multi-index woordenschat in de wiki-modal, waaruit de site ook extra bronlemma's afleidt.

- `../assets/library/library-catalog.json`
  De gegenereerde schoolbibliotheekcatalogus met scanpagina's voor PDF-bronnen en artikel-HTML voor Word-bronnen.

- `../assets/library/pages/`
  Vooraf gerenderde WebP-pagina's voor PDF-bronnen, zodat boeken per pagina gelezen worden zonder volledige PDF-runtime.

- `../assets/js/site.js`
  De huidige client-side runtime voor orbit, changelog, visietekst-modal, bibliotheekviewer, multi-index woordenschat, autolinks, backlinks en runtime-afgeleide bronlemma's.

- `../assets/css/wiki.css`
  De aanvullende stijlen voor de wiki-modal, rustige tekstlinks en visietekstweergave.

- `../scripts/assimilate_sources.py`
  De bronpipeline voor docx- en scanbronnen: renderen, roteren, OCR'en, structureren en uitschrijven naar wiki-bronnen en broncatalogus.

- `../scripts/generate_library_assets.js`
  De bibliotheekpipeline die PDF's rendert naar WebP-pagina's en Word-bronnen omzet naar rustige artikeldata.

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
