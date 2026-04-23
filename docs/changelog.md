# Changelog

## v0.2.45 - Rustigere wiki-focus

- De wiki-modal zet focus bij openen niet langer automatisch op de zoekbalk maar op de sluitknop, zodat de zoekinput niet meteen geselecteerd wordt
- Daardoor blijft de woordenboeknavigatie rustiger wanneer je de wiki opent of vanuit de site een item in de wiki opent
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.45`

## v0.2.44 - Robuustere publieke wiki

- De publieke wiki laadt canonieke items nu via een robuustere volgorde: eerst `/api/wiki/index`, dan een gegenereerde statische dataset in `wiki/generated/public-wiki-items.json`, en pas daarna losse markdownbestanden als fallback
- Een nieuwe generator `scripts/generate_wiki_public_data.js` en npm-script `wiki:public-data` toegevoegd zodat de publieke woordenboekdata uit de echte markdownbestanden kan worden opgebouwd zonder runtime-404's per item
- De markdown-fallback maakt de wiki niet meer volledig onbruikbaar wanneer een individueel `.md`-bestand ontbreekt; ontbrekende items worden nu gelogd en de rest van de woordenlijst blijft werken
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.44`

## v0.2.43 - Versieknop nog losser

- De versieknop rechtsboven nog eens 5px verder naar links geschoven zodat die nog meer afstand houdt van de ornamentale kader
- De extra marge opnieuw doorgetrokken in de responsieve layout zodat desktop en mobiel dezelfde ruimere offset houden
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.43`

## v0.2.42 - Versieknop meer lucht

- De versieknop rechtsboven ongeveer 5px verder naar links geschoven zodat die de ornamentale kader niet meer raakt
- De extra marge doorgetrokken in de responsieve layout zodat desktop en mobiel dezelfde veilige afstand tot de rand houden
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.42`

## v0.2.41 - Externe context voor alle woorden

- De externe contextlaag werd uitgebreid van alleen canonieke begrippen en letters naar de volledige publieke woordenlijst: canonieke lemma's, letterlijke alias-ingangen, bronafgeleide woorden en letters
- `server/wiki-external.js` reconstrueert nu dezelfde publieke woordenlaag als de wiki zelf, `scripts/generate_wiki_external.js` draait cache-eerst en de generator kreeg per-ingang timeouts zodat lange Wikimedia-verzoeken de volledige run niet meer blokkeren
- De externe cache is nu vooraf aangelegd voor alle 375 publieke woordenschatingangen in `wiki/generated/external/`, goed voor 97 ingangen met effectieve externe duiding en 278 voorlopige onopgeloste placeholders
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.41`

## v0.2.40 - Externe duiding in de woordenschat

- De publieke wiki-itemweergave toont nu onder de handmatige markdowntekst een aparte squircle-kaart voor `Internetverklaring` en `Etymologie`, geladen uit een nieuwe externe bronlaag
- Een nieuwe Wikimedia-pijplijn toegevoegd via `server/wiki-external.js`, `scripts/generate_wiki_external.js` en `npm run wiki:external`, met cachebestanden in `wiki/generated/external/` en een server-fallback op `/api/wiki/external`
- De externe context vooraf gegenereerd voor alle canonieke begrippen en alle 26 letters: 56 ingangen totaal, waarvan 47 met effectieve externe duiding en 9 voorlopig bewust onopgelost
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.40`

## v0.2.39 - Wiki-toggle logisch gespiegeld

- De wiki-sidebar-toggle leest nu visueel consistenter: wanneer de woordenlijst verborgen is staat de smalle balk links in het icoon, en wanneer de lijst open is schuift die naar rechts
- Alleen de icoonstate is omgedraaid; de bestaande collapse-logica en automatische opening via zoekveld en lijstchips blijven ongewijzigd
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.39`

## v0.2.38 - Cleanere conceptmodals

- De homepage-itemmodals tonen nu enkel nog de effectieve concepttekst; de vaste zijsecties `Beeldtaal` en `Uitbreiding` zijn uit de modal verwijderd
- De conceptmodal gebruikt nu weer een echte éénkoloms body, zodat er geen lege rechterkolom meer overblijft nadat de extra panelen weg zijn
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.38`

## v0.2.37 - Rustiger wiki-toggle

- De wiki-sidebar start nu opnieuw standaard ingeklapt met een verfijndere toggle-icoon zonder middenlijn, zodat de artikelweergave rustiger opent
- Interactie met `Zoek in de Woordenschat` of met de lijstchips `Alles`, `letters`, `woorden` en `teksten` opent de verborgen woordenlijst automatisch zodra die nodig is
- De voorkeursopslag voor de woordenlijst ververst naar een nieuwe sleutel, zodat bestaande open-states uit de vorige iteratie de nieuwe standaard niet blokkeren
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.37`

## v0.2.36 - Inklapbare wiki-zijbalk

- De publieke wiki-modal kreeg een inklapbare woordenlijstkolom met een subtiele outline-toggle in de toolbar, zodat de sidebar nu verborgen of teruggehaald kan worden zonder de modal te verlaten
- De collapse-state wordt in `localStorage` onthouden en klapt de directory zowel op desktop als mobiel echt uit de layout, zodat de artikelkolom maximaal ruimte krijgt
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.36`

## v0.2.35 - Wiki laadfout hersteld

- De publieke wiki laadde niet meer omdat `wiki/meta/curated-index.md` nog verwees naar `Spel & creativiteit`, terwijl het canonieke itembestand per ongeluk was verplaatst naar een niet-overeenkomende bestandsnaam
- Het canonieke bestand voor `Spel & creativiteit` hersteld naar `wiki/items/spel-en-creativiteit.md`, zodat `loadWikiData()` opnieuw volledig doorloopt en de wiki plus automatische tekstlinks weer werken
- `scripts/audit_wiki_dictionary.py` uitgebreid met een controle op ontbrekende canonieke itembestanden op basis van de curated index, zodat dit type breuk voortaan direct zichtbaar wordt
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.35`

## v0.2.34 - Woordenboek vereenvoudigd

- De publieke woordenschatlaag in `assets/js/site.js` vereenvoudigd naar drie indexsoorten: `letters`, `woorden` en `teksten`, waarbij meerwoordige lemma's nu gewoon in dezelfde woordenlijst landen en bronpassages niet langer als aparte publieke ingangen getoond worden
- De bronafgeleide woordenboekingangen opgeschoond: enkel termen die aan bestaande wiki-termen raken blijven over, bronpagina's verwijzen niet meer expliciet naar losse passagepagina's en enkelvoud/meervoud-varianten worden strakker samengevoegd
- De canonieke wiki-inhoud opgeschoond door dubbele itembestanden te verwijderen, relevante aliassen in `links` te bewaren en een onderhoudslaag toe te voegen via `wiki/meta/woordenboek-richtlijnen.md` en `scripts/audit_wiki_dictionary.py`
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.34`

## v0.2.33 - Onderhoeken gecorrigeerd

- De onderste ornamentale hoeken opnieuw lokaal gecorrigeerd: linksonder en rechtsonder kregen een juist gedraaide onderste spiraal, en de grote boog van de rechteronderhoek volgt nu weer de juiste binnenwaartse sweep
- De vaste paginakader nog ongeveer `2px` verder naar buiten geschoven zodat de band strakker uitlijnt met de hoeken zonder hun huidige positie te verschuiven
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.33`

## v0.2.32 - Kaderband verder naar buiten

- De vaste paginakader een kleine CSS-outset gegeven zodat de gouden band enkele pixels verder naar buiten valt en netter uitlijnt met de ornamentale hoeklijnen
- De hoek-SVG's zelf ongemoeid gelaten zodat hun huidige positie, krulrichting en medaillonplaatsing behouden blijven
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.32`

## v0.2.31 - OCR-cache genegeerd

- De OCR-tooling laat haar render- en Tesseract-cache in `tmp/` achter, daarom wordt die map nu expliciet genegeerd in `.gitignore` zodat de werkboom proper blijft na een bronassimilatie
- De eerder verfijnde scanassimilatie en de opnieuw opgebouwde brondata uit `wiki/sources/` en `wiki/meta/source-catalog.json` blijven de actuele staat van de OCR-rebuild
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.31`

## v0.2.30 - OCR-passages opgeschoond

- De scanassimilatie in `scripts/assimilate_sources.py` verfijnd met bron-specifieke passagecoalescing voor OCR-pagina's, zodat Excalibur en `Het boek der geruststelling` niet meer als duizenden losse scanregels in de dataset vallen
- Visuele scanpagina's zoals kaart- en schemapagina's nu expliciet als beeldlaag gemarkeerd in `wiki/sources/` in plaats van als corrupte pseudo-tekst in de bronmarkdown te belanden
- De broncatalogus opnieuw gegenereerd met datasetstatistiek in `wiki/meta/source-catalog.json`, goed voor 692 passages in totaal, waarvan 407 uit `Excalibur` en 95 uit `Het boek der geruststelling`
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.30`

## v0.2.29 - Krullen naar binnen

- De vier ornamentale hoek-SVG's opnieuw individueel uitgetekend zodat elke krul nu consequent aan de binnenzijde van de paginakader valt in plaats van bij sommige hoeken naar buiten te lezen
- De rechte kaderlijnen, hoofdboog en goudtoonfamilie behouden zodat alleen de handigheid van de kleine spiralen werd gecorrigeerd zonder opnieuw kleur- of uitlijningsruis te introduceren
- De zichtbare versieverwijzingen gesynchroniseerd naar `v0.2.29`

## v0.2.28 - Hoektoon en krulrichting

- De ornamentale hoek-SVG's opnieuw opgebouwd met dezelfde goudtoonfamilie als de vaste paginakader, zodat hoeklijnen en frameband niet langer als twee verschillende metalen lezen
- Het lijnwerk van alle vier de hoeken nu vanuit één basisornament intern geroteerd in plaats van gespiegeld, zodat de krullen hun richting behouden en niet meer verkeerd om aanvoelen
- De medaillonranden en zichtbare versieverwijzingen gesynchroniseerd naar `v0.2.28`

## v0.2.27 - Hoeken op de frameband

- De hoek-SVG's opnieuw naar de buitenrand van hun viewBox verschoven zodat hun rechte stam- en basislijnen beter op de vaste paginakader uitkomen in plaats van zichtbaar binnen de band te landen
- De vaste frameband en de rechte hoeklijnen nog iets verdikt zodat kader en hoekornamenten als éénzelfde gouden systeem lezen
- De krullen op alle vier de hoeken opnieuw georiënteerd vanuit de kaderlijn zelf en de zichtbare versieverwijzingen gesynchroniseerd naar `v0.2.27`

## v0.2.26 - Excalibur OCR hersteld

- De bronassimilatie uitgebreid met betere OCR-tooling voor scans: automatische rotatiekeuze per pagina, meerdere OCR-layoutmodi en OpenCV-preprocessing vóór Tesseract
- De uiteindelijke tekstextractie losgekoppeld van de TSV-scorelaag, zodat de gekozen pagina-instelling nu ook als leesbare platte tekst in `wiki/sources/` terechtkomt
- De Excalibur- en scanbron-ingest opnieuw opgebouwd en de wiki-dataset opnieuw gegenereerd vanuit de verbeterde OCR-pass
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.26`

## v0.2.25 - Hoeken uitgelijnd

- De ornamentale hoeken opnieuw individueel uitgetekend zodat de krullen op de rechter- en onderhoeken niet langer als loutere spiegelkopieën lezen
- De lijnvoering van de hoek-SVG's en de vaste paginakader verdikt zodat de ornamenten beter aansluiten op de gouden frameband
- De hoeklijnen opnieuw afgestemd op de vaste kader en de zichtbare versieverwijzingen gesynchroniseerd naar `v0.2.25`

## v0.2.24 - Hoeken naar schets

- De ornamentale hoek-SVG's opnieuw opgebouwd op basis van de schets: een grotere medailloncirkel met hart, een rechte kader die tot aan de cirkel loopt en één grote boog die de hoek naar binnen afrondt
- De overlappende binnenlijnen verwijderd en vervangen door precies twee kleine krulspiralen in de open ruimte tussen kader en boog
- De hartjes opnieuw gecentreerd binnen de grotere cirkels en de zichtbare versieverwijzingen gesynchroniseerd naar `v0.2.24`

## v0.2.23 - Hoeken met spiraal

- De vier ornamentale hoek-SVG's opnieuw vereenvoudigd zodat de overlappende binnenlijnen verdwijnen en elke hoek nu vooral leest als een hoofdboog met een losse sierlijke spiraalkrul
- De medaillons rond de hartjes vergroot zodat ze royaler aanvoelen binnen de hoekcompositie
- De hartjes opnieuw gecentreerd binnen de grotere cirkels en de zichtbare versieverwijzingen gesynchroniseerd naar `v0.2.23`

## v0.2.22 - Alles-filter verduidelijkt

- De `Alles`-chip in de wiki-header omgevormd tot een echte gecombineerde alfabetische lijst over alle types heen, zodat die niet meer aanvoelt als een verkapte letterindex
- De gecombineerde `Alles`-weergave verduidelijkt met een subtiele typevermelding per ingang, zoals `Letter`, `Woord`, `Begrip`, `Passage` of `Tekst`
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.22`

## v0.2.21 - Hoeken verfijnd

- De vier ornamentale hoek-SVG's opnieuw getekend met minder kleine lusjes en een soberder lijnritme zodat de kader properder en verfijnder leest
- De hoekmedaillons vereenvoudigd tot strakkere concentrische ringen met een rustigere goudopbouw die beter aansluit op de smalle frameband
- De roze hartjes in alle vier de medaillons opnieuw symmetrisch uitgelijnd en optisch gecentreerd binnen hun cirkel

## v0.2.20 - Rustigere wiki-modal

- De header van de publieke wiki-modal vereenvoudigd met klikbare sectiechips voor `letters`, `woorden`, `begrippen`, `passages` en `teksten`, zodat de index rechtstreeks per laag gefilterd kan worden
- De itemdetailweergave opgeschoond door de meta-eyebrow zoals `Woordenboekingang` en de aparte `In`/`Uit`-kaders weg te laten, zodat de focus terug volledig op de effectieve tekst ligt
- De inline wikilinks in artikels verder verfijnd naar rustige blauwe tekstlinks met onderlijning en zonder knopgevoel
- De zichtbare versie- en documentatieverwijzingen gesynchroniseerd naar `v0.2.20`

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
