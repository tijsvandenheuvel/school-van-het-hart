# Woordenboek-richtlijnen

Deze richtlijnen gelden voor het onderhouden van de woordenlijst in `wiki/items/`.

## Canonieke lemma's

- Gebruik per betekenis één canonieke markdownpagina.
- Kies in `title` de voorkeursvorm die publiek het duidelijkst en eenvoudigst leest.
- Meerwoordige lemma's blijven gewoon woordenboekingangen. Maak daar geen aparte indexsoort voor.

## Variaties en aliassen

- Zet komma-varianten, ampersand-varianten, enkelvoud/meervoud en verwante schrijfwijzen in `links`.
- Gebruik `links` ook voor courante Engelse termen, afkortingen en bronvarianten.
- Maak geen extra pagina aan voor een variant die alleen als alias of schrijfwijze dient.
- Aliasvarianten die alleen een verbindingswoord of leesteken missen, blijven zoekbaar maar horen niet als apart zichtbaar lemma in de publieke lijst.

## Kandidaattermen

- Routeer betekenisvolle kandidaatwoorden eerst naar het sterkste bestaande begrip via `links`.
- Maak pas een nieuw canoniek item wanneer de kandidaat een eigen beschrijving, relaties en onderhoudswaarde heeft.
- Zet generieke werkwoorden, losse projecttaal en te brede woorden in `wiki/meta/ignored-terms.md`.
- Controleer na elke ronde of `/api/wiki/index` geen oude ruis opnieuw als kandidaat blijft aanbieden.

## Bronafgeleide termen

- Neem alleen brontermen op die betekenis dragen in de School van het Hart-context.
- Vermijd pure OCR-ruis, losse slogans zonder context en decoratieve paginataal.
- Laat bronafgeleide woorden liefst aansluiten op bestaande lemma's via wikilinks in de body.

## Duplicaten opruimen

1. Kies de sterkste canonieke titel.
2. Verplaats bruikbare inhoud naar die pagina.
3. Voeg oude varianten toe aan `links`.
4. Verwijder de overbodige dubbele pagina.
5. Controleer daarna de index en interne links.

## Praktische check

Gebruik `python3 scripts/audit_wiki_dictionary.py` om:

- dubbele genormaliseerde titels of aliassen te vinden
- niet-geïndexeerde itembestanden te zien
- vermoedelijke enkelvoud/meervoud-conflicten te signaleren
