# AGENTS.md

## Doel

Dit project gebruikt een eenvoudige static-site workflow zonder buildstap. Daarom moeten versiebeheer, changelog en zichtbare UI-feedback handmatig maar consequent mee evolueren bij elke wijziging.

## Canonieke versiebron

- `docs/changelog.md` is de bron van waarheid voor de actuele versie en de volledige wijzigingsgeschiedenis.
- De eerste entry met formaat `## vX.Y.Z - Titel` geldt als de huidige versie.
- `index.html` leest die bovenste changelog-entry in en toont die versie rechtsboven in de versieknop.
- De changelog-modal op de website leest dezelfde `docs/changelog.md` in; werk dus altijd eerst dat bestand bij.

## Verplichte workflow bij elke wijziging

1. Voer de code-, inhouds- of layoutwijziging uit.
2. Voeg onmiddellijk bovenaan `docs/changelog.md` een nieuwe entry toe met de volgende versie en concrete bullets.
3. Controleer dat de versieknop in `index.html` de nieuwe versie toont en dat de changelog-modal de nieuwe entry weergeeft.
4. Werk expliciete versievermeldingen in documentatie bij als ze nog een vaste versie noemen.
5. Controleer bij layout- of interactiewijzigingen minstens desktop `1440x820` en mobiel `390x844`.

## Versieregel

- In deze fase verhogen we minstens de patchversie bij elke echte change: `v0.1.x`.
- Sla geen changelog-entry over, ook niet voor kleine iteraties.
- Gebruik een korte titel per release en beschrijf veranderingen in concrete bullets.

## Werkafspraken

- Werk verder in `index.html` als enige actieve frontend-entrypoint.
- Maak geen parallelle HTML-varianten als concurrerende bron van waarheid.
- Houd `docs/concepts.md` en de conceptmodal in `index.html` inhoudelijk synchroon.
