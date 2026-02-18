
# Speler Uitlichten — Simpel "Man of the Match" template

## Concept

Een minimalistisch template waar de **eigen foto het verhaal vertelt**. Geen statistiekenoverzicht, geen volledige spelerskaart. Gewoon:

- De uploadbare foto op volle grootte als achtergrond (bijv. een speler die juicht na een hattrick)
- Onderaan een subtiele overlay met alleen de **spelernaam** en een **korte tagline** die je zelf typt (bijv. "Hat-trick hero", "Man of the Match", "Debuutgoal")
- AZ Fanpage logo rechtsonder
- Rode gradient-lijn bovenaan (consistent met de andere templates)

Meer niet. De foto doet het werk.

## Hoe het werkt

1. Je selecteert het template "Speler"
2. Je uploadt een foto (bestaande upload-functie)
3. Je typt een spelernaam en een korte tagline in twee tekstvelden
4. De preview toont de foto full-bleed met onderaan naam + tagline
5. Download als PNG

Geen API-calls, geen spelerselectie-dropdown, geen statistieken. Puur visueel.

## Technische aanpak

### 1. TemplateSelector.tsx
- `TemplateType` uitbreiden met `'player'`
- Nieuw item: `{ id: 'player', label: 'Speler', icon: User, format: '1080x1080' }`

### 2. Nieuw: PlayerHighlightTemplate.tsx
- Props: `playerName`, `tagline`, `backgroundImage`
- Layout (1080x1080):
  - Achtergrondafbeelding full-bleed (of donkere fallback als er geen foto is)
  - Gradient-overlay onderaan (van transparant naar zwart) zodat tekst leesbaar is
  - Spelernaam in grote, vette letters
  - Tagline eronder in iets kleiner, lichtere stijl
  - Rode lijn bovenaan + AZ Fanpage logo rechtsonder

### 3. Visuals.tsx
- State toevoegen: `playerName` (string) en `tagline` (string)
- Twee tekstvelden tonen wanneer template `'player'` is geselecteerd
- `backgrounds` record uitbreiden met `player: null`

### 4. VisualPreview.tsx
- `playerName` en `tagline` als props ontvangen
- `PlayerHighlightTemplate` renderen wanneer template `'player'`
- Template size: `player: { w: 1080, h: 1080 }`

### Geen nieuwe dependencies of API-calls nodig
Alles draait op de bestaande upload-functie en handmatige tekstinvoer.
