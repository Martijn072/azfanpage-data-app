

# Storyformaat (1080x1920) voor vier templates

## Wat verandert er

Vier foto-templates krijgen naast het vierkante formaat (1080x1080) ook een **storyformaat** (1080x1920): **Speler**, **Citaat**, **Breaking** en **Matchday**.

Een kleine format-toggle (twee icoontjes: vierkant en verticaal) verschijnt wanneer een template beide formaten ondersteunt. De overige zes templates blijven alleen vierkant.

## Aanpak

### 1. Format-toggle toevoegen

Een nieuw klein UI-element onder de template-selector: twee knoppen (vierkant-icoon / story-icoon) die alleen zichtbaar zijn bij templates die story ondersteunen (`player`, `quote`, `breaking`, `gameday`).

**State**: nieuw `format` state in `Visuals.tsx` met waarde `'square' | 'story'`, die automatisch terugspringt naar `'square'` als je naar een template wisselt die geen story ondersteunt.

### 2. Template-componenten aanpassen

Elk van de vier templates krijgt een optionele `format` prop. Bij `'story'` wordt de container `1080x1920` i.p.v. `1080x1080`, en worden de layout-posities aangepast:

- **PlayerHighlightTemplate**: Tekst lager gepositioneerd zodat de foto meer ruimte krijgt bovenaan
- **QuoteTemplate**: Citaat centraal met meer verticale ademruimte
- **BreakingTemplate**: Meer ruimte boven de headline, breaking-badge hoger
- **GamedayTemplate**: Teamlogo's en wedstrijdinfo centraal, "MATCHDAY" tekst bovenaan met meer lucht

### 3. VisualPreview aanpassen

- `TEMPLATE_SIZES` wordt dynamisch op basis van template + format
- De `scale`-berekening past zich aan op het hogere canvas (1920 hoogte)
- Download-bestandsnaam krijgt een `-story` suffix bij storyformaat

### 4. TemplateSelector aanpassen

- De `format`-string in de selector toont dynamisch "1080x1080" of "1080x1920" afhankelijk van de actieve keuze

## Bestanden die wijzigen

- `src/pages/app/Visuals.tsx` -- format-state, toggle UI, auto-reset bij template-wissel
- `src/components/visuals/VisualPreview.tsx` -- dynamische sizing, format prop doorgeven
- `src/components/visuals/TemplateSelector.tsx` -- dynamisch format-label
- `src/components/visuals/templates/PlayerHighlightTemplate.tsx` -- format prop, aangepaste layout
- `src/components/visuals/templates/QuoteTemplate.tsx` -- format prop, aangepaste layout
- `src/components/visuals/templates/BreakingTemplate.tsx` -- format prop, aangepaste layout
- `src/components/visuals/templates/GamedayTemplate.tsx` -- format prop, aangepaste layout

## Technische details

### Format-toggle component

Klein inline component in `Visuals.tsx` (geen apart bestand nodig): twee knoppen met `Square` en `RectangleVertical` iconen uit lucide-react. Alleen getoond wanneer `['player', 'quote', 'breaking', 'gameday'].includes(selected)`.

### Template layout-aanpassingen bij story

De vier templates krijgen conditionele styling op basis van `format === 'story'`:

- Container hoogte: `1080` wordt `1920`
- Verticale posities verschuiven (bijv. tekst-blok van `bottom-14` naar `bottom-24`)
- Font-sizes blijven gelijk (de extra ruimte geeft ademruimte, geen grotere tekst)
- Overlays en text-shadows blijven identiek

### Geen nieuwe dependencies

Alleen bestaande lucide-react iconen en Tailwind classes.
