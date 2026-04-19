# Changelog

## v0.2.19 - Bronlemma's en rijkere bronindex

- De publieke woordenschat uitgebreid met runtime-gegenereerde bronlemma's uit de geassimileerde passages, zodat meer woorden en meerwoordbegrippen uit de bronteksten als eigen ingangen doorzoekbaar en aanklikbaar worden
- De interne wiki-relaties verbeterd zodat expliciete `[[wikilinks]]` ook in de verbindingenlogica meetellen, inclusief verwijzingen naar bronteksten en bronpassages
- `wiki/meta/source-index.md` inhoudelijk verrijkt met overzicht, passageaantallen en bronbestandsverwijzingen per tekst, zodat de bronnenlaag zelf ook leesbaarder gedocumenteerd blijft
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.19`

## v0.2.18 - Taalbewuste bronassimilatie

- Een bronpipeline toegevoegd in `scripts/assimilate_sources.py` die docx- en scanbronnen rendert, roteert, OCR't en uitschrijft naar `wiki/sources/` en `wiki/meta/source-catalog.json`
- De publieke wiki-modal uitgebreid tot een bredere `Woordenschat` met aparte indexsecties voor letters, woorden, begrippen, zinnen/paragrafen en bronteksten
- Nieuwe bronteksten `Excalibur` en `Het boek der geruststelling` geïntegreerd naast de bestaande SvHH-bronnen, inclusief 4 bronteksten, 510 passages en een alfabetindex van 26 letterpagina's
- `Taalbewustzijn` expliciet verankerd als projectprincipe in `docs/taalbewustzijn.md`, de documentatie en de wiki-inhoud

## v0.2.17 - Woordenboekingangen en bronbegrippen

- De wiki omgevormd van alias-doorgangen naar een echte woordenboeklaag waarin brontermen als eigen woordenboekingangen renderen, ook wanneer ze intern uit markdown-links worden afgeleid
- Nieuwe canonieke lemma's toegevoegd voor `Aarde`, `Water`, `Lucht`, `Vuur`, `Elementen` en `Aarde, water, lucht & vuur`, zodat natuurtermen niet langer onterecht direct op `Natuurverbinding` landen
- De bestaande wiki-items inhoudelijk uitgebreid met extra brontermen zoals `school`, `woorden`, `communicatie`, `bewustzijn`, `materie`, `seedcamp`, `vision circle` en `food circle`
- De woordenboeklaag telt nu 160 letterlijke ingangen uit de bronpass, met 30 canonieke markdownpagina's en 0 onopgeloste wikilinks

## v0.2.16 - Subtielere kader- en linkstijl

- De kaderschakelaar linksboven teruggebracht tot één subtiele icoonknop zonder zichtbare labels, terwijl de voorkeur nog altijd lokaal bewaard blijft
- De wiki- en begrippenlinks in conceptteksten, visietekst en wiki-artikelen herwerkt naar rustige blauwe tekstlinks met onderlijning zodat de leesflow minder onderbroken wordt
- De zichtbare UI- en documentatieverwijzingen gesynchroniseerd naar `v0.2.16`

## v0.2.15 - Begrippenwiki uit alle teksten

- Een echte client-side wiki pass toegevoegd op basis van markdownbronnen in `wiki/items/`, inclusief `wiki/meta/curated-index.md` en de volledige visietekst in `docs/visietekst.md`
- De homepage uitgebreid met een publieke wiki-modal, een woordenboekindex over 24 canonieke wiki-items en 111 geïndexeerde termen, plus backlinks en uitgaande links per item
- De conceptmodals en de visietekst-modal laten nu dezelfde begrippenset autolinken zodat termen uit alle hoofdteksten rechtstreeks naar de juiste wiki-itemweergave openen
- De bestaande titeltrigger, wiki-knop en kaderschakelaar technisch samengebracht onder één nieuwe runtime in `assets/js/site.js` en `assets/css/wiki.css`

## v0.2.14 - Kaderschakelaar

- Een eenvoudige `Aan`/`Uit`-segmentschakelaar toegevoegd naast de `Wiki`-knop om de ornamentale kader live te tonen of te verbergen
- De gekozen stand lokaal onthouden zodat de kader na herladen in dezelfde toestand blijft
- De linksboven controls herschikt tot een gedeelde control group en de versieflow gesynchroniseerd naar `v0.2.14`

## v0.2.13 - Titel opent visietekst

- De paginatitel `School van het Hart` klikbaar gemaakt zodat hij een eigen visietekst-modal opent
- De volledige visietekst als markdownbron toegevoegd in `docs/visietekst.md` en rechtstreeks op de site laten renderen
- De nieuwe visietekst-modal afgestemd op de bestaande modal-logica en de responsieve titelschaal gecorrigeerd zodat de klikbare titel ook op mobiel netjes schaalt

## v0.2.12 - Verbindingen en alfabet

- De letterknoppen boven de woordenlijst vervangen door één `ABC`-knop die een compact alfabetmenu opent om naar letters in het woordenboek te springen
- De itemtabs hernoemd en vereenvoudigd naar `Beschrijving` en `Verbindingen`, waarbij `Verbindingen` nu een lijst `In` en een lijst `Uit` toont
- De verbindingen visueel herwerkt zodat elke link als één duidelijke kaderkaart rendert in plaats van als losse knop met los label
- De inline wikilinks in artikelteksten ook visueel herwerkt naar kleine afgeronde wiki-labels zodat alle linkstijlen consistenter aanvoelen

## v0.2.11 - Beschrijving opgeschoond

- De extra linklijst weer uit de beschrijvingstab verwijderd zodat de hoofdweergave proper blijft en volledig op het artikel focust
- De tijdelijke hulplogica en bijhorende stijlen voor die lijst weggehaald zodat de publieke wiki-code weer eenvoudiger aansluit op de sobere UI
- De detailweergave van een item teruggebracht tot een schone markdown-artikelpagina zonder overbodige zijmeta in de beschrijvingstab

## v0.2.10 - Relevante linklijst

- De losse blokken `Linknamen / aliassen`, `Interne links` en `Gerelateerd` in de publieke itemweergave samengevoegd tot één top-10 lijst met relevante links
- De relevante links gewogen op basis van aliassen, directe interne wikilinks en relationele nabijheid zodat de zijbalk compacter en nuttiger wordt
- De beschrijvingstab vereenvoudigd met één duidelijk linkoverzicht in plaats van drie concurrerende metadata-panelen

## v0.2.9 - Linknamen verduidelijkt

- De `Linknamen / aliassen` in de publieke wiki-itemweergave klikbaar gemaakt zodra ze naar een bestaand item oplossen
- Bij de linknamen kort verduidelijkt dat deze termen dienen als aliassen en zoek-/resolutietermen voor interne verwijzingen
- De publieke itemweergave iets begrijpelijker gemaakt zonder extra complexiteit aan de wiki-shell toe te voegen

## v0.2.8 - Wiki-header versoberd

- De publieke wiki-header sterk vereenvoudigd tot terug, vooruit, zoekveld, compacte itemteller en een sluitknop met `×`
- De grote introductietekst en publieke filterknoppen uit de wiki-modal verwijderd zodat de woordenboekindex veel minder verticale ruimte verliest
- De indexkolom technisch aangescherpt met een vaste modalhoogte en eigen scrollcontainer zodat de A-Z lijst werkelijk door te scrollen is
- De zoekbalk visueel beter geïntegreerd in de toolbar en de lege rechterkolom teruggebracht tot een eenvoudige keuzehint

## v0.2.7 - Wiki als woordenboek

- De publieke wiki-modal omgebouwd tot een echte wiki-shell met een blijvende indexkolom en een hoofdweergave voor gerenderde markdown-artikelen
- De itempagina’s strakker als wiki-artikelen laten werken door leidende titelkoppen uit de markdownbody weg te halen en wikilinks binnen dezelfde modal te houden
- De publieke wiki laten laden uit de volledige serverindex zodat alle items uit `wiki/items/` zichtbaar worden in het woordenboek en niet enkel de curated lijst
- Een scrollbare A-Z woordenboekindex toegevoegd met letterjump, itemmeta en directe artikelopening vanuit de zijbalk
- De admin-preview gelijkgetrokken met dezelfde artikelrendering zodat publieke weergave en lokale preview dichter op elkaar liggen

## v0.2.6 - Markdown-wiki laag

- Een file-based wiki toegevoegd met canonieke markdown-items in `wiki/items/` en markdown-meta in `wiki/meta/`
- Een gedeelde wiki-kern gebouwd voor frontmatter parsing, markdown rendering, Obsidian-wikilinks, linkresolutie, indexering, backlinks en zoeklogica
- Een publieke `Wiki`-modal geïntegreerd in `index.html` met index, zoeken, filters, itemviews, wikilink-navigatie en back/forward-traversal binnen dezelfde overlay
- Een lokale adminroute `/admin/wiki` en een kleine Node-server toegevoegd voor itembeheer, live preview, directe markdown-save en kandidaat/relatiecuratie
- De kandidaat-extractie aangescherpt tot een beperktere, bruikbare shortlist op basis van conceptdocs en bestaande wiki-items
- Versieflow, docs en lokale verificatie geactualiseerd voor deze wiki-pass

## v0.2.5 - Beeldtooling voor hoeken

- Een lokale OpenAI image-module toegevoegd waarmee beeldstudies vanuit prompt en referentiebeelden als PNG naar de repo-output geschreven kunnen worden
- Een projectgerichte corner-study generator toegevoegd die `assets/design-example.jpeg` gebruikt als stijlinspiratie voor nieuwe hoekverkenningen
- De bestaande SVG-hoeken subtiel verder afgewerkt met rijkere goudtonen zodat de site al een nettere bron-geinspireerde hoekpass krijgt, ook zonder live image-run
- De versieflow gesynchroniseerd tussen site, docs en `package.json` zodat de toolingpass als echte iteratie meetelt

## v0.2.4 - Hoeken opgeschoond

- De hoekornamenten opnieuw getekend met minder losse vormen en een duidelijkere hoofdlijn zodat de kader eleganter leest
- Het hartmedaillon steviger in de hoekband ingebed zodat het minder als los icoontje en meer als onderdeel van de rand aanvoelt
- De hoekmaat licht vergroot en de schaduw aangescherpt zodat de ornamenten op desktop en mobiel beter dragen zonder zwaarder te worden

## v0.2.3 - Compacte mobiel verfijnd

- De compacte mobiele orbit horizontaal opnieuw uitgebalanceerd zodat rechterlabels beter binnen de kader blijven
- De onderste `HOE`-labels verder uit elkaar gezet zodat `Zelfbestuur` en `Cirkels` niet meer in elkaar schuiven
- De versieflow en documentatie opnieuw gesynchroniseerd met deze finale v0.2.3-pass

## v0.2.2 - Mobiele kaderpass

- De compacte small-screen layout verbreed naar een robuustere breakpoint zodat de mobiele compositie ook echt op tijd omschakelt
- De orbit op small screens strakker georkestreerd met bewustere compacte posities rond de kern
- Titel, versieknop, hartmaat en verticale spacing op mobiel opnieuw afgestemd zodat de paginakader leesbaarder blijft

## v0.2.1 - De paginakader verfijnd

- De ornamentale kader herwerkt zodat ze nu de volledige pagina omsluit, inclusief titel en versieknop
- De brede dubbele lijn vervangen door een smallere gouden band met subtiele tintverschillen in dezelfde band
- De regenboogaccenten verwijderd en vier eenvoudiger, elegantere hoek-SVG's gemaakt met een rechtopstaand hart in elke hoek
- De oude geroteerde hoekaanpak losgelaten zodat de hoekornamenten niet langer visueel fout meedraaien
- Responsive spacing opnieuw afgestemd zodat de page chrome beter past binnen desktop en smalle schermen

## v0.2.0 - De ornamentale kader

- Een eerste ornamentale frame-laag toegevoegd rond de hoofdcompositie in `index.html`
- Een herbruikbare SVG-hoekasset gemaakt met goudlijnwerk, hartmedaillon, zachte sparkles en regenbooglint
- De vier hoeken opgebouwd vanuit die ene asset en de tussenliggende randstukken responsief in CSS getekend
- De sierlaag technisch decoratief gehouden met `pointer-events: none`, zodat orbit en modals ongewijzigd klikbaar blijven
- Vaste versievermeldingen in docs en de initiële versieknop gesynchroniseerd naar `v0.2.0`

## v0.1.9 - Changelog op de site

- De versie-indicator rechtsboven omgebouwd tot een echte knop die de changelog opent
- Een aparte changelog-modal toegevoegd zodat bezoekers de ontwikkelgeschiedenis rechtstreeks op de website kunnen bekijken
- De changelog-modal vereenvoudigd tot enkel de changelog zelf, zonder extra zijpanelen
- `index.html` laat de versieknop en changelog-modal automatisch de actuele inhoud uit `docs/changelog.md` lezen
- Een nieuw `AGENTS.md` toegevoegd dat vastlegt dat elke wijziging meteen ook de changelog en versieflow moet bijwerken

## v0.1.8 - Browser compatibiliteit

- Firefox-compatibiliteit verbeterd voor de conceptkaarten in de orbit
- Rendering-stack vereenvoudigd zodat de concepten ook in Firefox zichtbaar blijven
- Cross-browser gedrag afgestemd tussen Firefox, Chrome en Safari
- Orbit-interactie en modals behouden terwijl de visuele rendering stabieler werd gemaakt

## v0.1.7 - Nieuwe teksten

- De 12 conceptteksten inhoudelijk herwerkt op basis van `docs/bronnen/svhh basisdoc.docx` en `docs/bronnen/svhh visietekst.docx`
- De selectie van 6 `WAT`- en 6 `HOE`-concepten bevestigd en gedocumenteerd in `docs/concepts.md`
- De modal uitgebreid zodat tussentitels en meerdere alinea's per concept renderen
- Docs en versieverwijzingen gesynchroniseerd met de nieuwe inhoudspass

## v0.1.6 - Verfijnde cirkel

- Titel kleiner gemaakt en iets lager geplaatst
- Zichtbare orbit-lijn verwijderd
- Linksonder-boog herschikt voor een consistenter ritme
- Compact mobile hoekverdeling toegevoegd voor `<=420px`
- Desktop en mobiel opnieuw gecontroleerd op overlap en clipping

## v0.1.5 - Titel bovenaan

- Titel `School van het Hart` uit het hart gehaald en bovenaan geplaatst
- Hart opgeschoond zodat het geen storende interne tekst meer draagt
- Cirkel groter gemaakt op brede schermen
- Mobile sizing verfijnd zodat labels binnen beeld blijven

## v0.1.4 - Nieuwe indeling

- Verder gewerkt in `index.html` als hoofdversie
- 12 concepten rond een centrale cirkel geplaatst
- `WAT`, hart en `HOE` in de kern gezet
- Versiebadge vereenvoudigd en naar rechtsboven verhuisd
- Tweede variantfile uit de hoofdflow gehaald

## v0.1.3 - Uitgelijnde cirkel

- Cirkelrendering sterk verbeterd zodat de compositie als één geheel leesbaar werd
- Positionering van de conceptkaarten verfijnd tot een duidelijkere en rustigere orbit
- `WAT`, hart en `HOE` beter uitgebalanceerd in de centrale compositie
- De versieknop of versiebadge visueel beter uitgewerkt en duidelijker geïntegreerd in de pagina

## v0.1.2 - Vereningd bestand

- Eerste volledige versie gebouwd als één `index.html` met plain HTML, CSS en JavaScript
- React-aanpak verlaten ten gunste van een eenvoudiger, lichter en deelbaar bestand
- Hart, centrale compositie en klikbare conceptkaarten overgezet naar een frameworkvrije opzet
- De concepten stonden al bijna in een cirkel, maar de compositie was nog niet volledig uitgezuiverd
- `WAT` en `HOE` stonden in deze fase nog buiten de uiteindelijke centrale cirkelopbouw

## v0.1.1 - Eerste vorm

- Eerste prototype door ChatGPT gegenereerd als React-component
- Eerste visuele scherm opgezet met centrale hartcompositie
- Eerste aanzet gemaakt voor de 12 concepten en de klikbare detailweergave
- De concepten stonden nog niet in een uitgewerkte cirkelstructuur
- Deze versie diende vooral als snelle schets van richting, sfeer en interactie

## v0.0.0 - De Prompt

- Het project bestond nog als visie, prompt en schets
- Eerste designrichting bepaald: een kunstzinnige webpagina met een hart als kern
- Eerste keuzes gemaakt rond kleurpalet, sfeer, `WAT` en `HOE`, en de orbit van concepten rond het hart
- Ruwe papieren schets en visietekst vormden het vertrekpunt van de site
