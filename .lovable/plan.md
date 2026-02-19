
# Leesbaarheid verbeteren bij alle visuele templates

## Probleem

Wanneer een achtergrondafbeelding wordt geupload, is tekst in veel templates slecht leesbaar. De huidige overlays zijn te licht, vooral in het midden van de afbeelding waar de content staat. Dit geldt voor vrijwel alle templates.

## Oplossing: drie lagen van leesbaarheid

Elke template krijgt een combinatie van drie technieken:

### 1. Sterkere donkere overlay
De huidige overlays varieren van 30% tot 65% dekking. We brengen de minimale dekking naar **70%** en voegen waar nodig een extra **vaste base overlay** toe bovenop de gradient.

### 2. Text-shadow op alle tekst
Alle tekstelementen krijgen een `textShadow` zodat ze ook bij lichtere plekken in de foto leesbaar blijven:
- Grote tekst (titels, scores): `0 2px 12px rgba(0,0,0,0.8)`
- Kleine tekst (data, venue): `0 1px 6px rgba(0,0,0,0.7)`

### 3. Semi-transparante achtergrond achter tekstvlakken (waar nodig)
Bij templates waar tekst centraal staat over de foto (Gameday, Poll, Stat), krijgt het tekstblok een subtiele `backdrop-filter: blur` of een semi-transparante achtergrondkleur.

---

## Per template

### GamedayTemplate (Matchday) -- meest urgente fix
- **Nu**: gradient van 60% boven naar 30% midden naar 70% onder -- veel te licht in het midden
- **Straks**: base overlay `bg-black/50` plus gradient, zodat de minimale dekking 50%+ is. "MATCHDAY" tekst krijgt witte kleur met rode accent-lijn erboven (ipv rode tekst die verdwijnt). Tekst-shadow op alles.

### ResultTemplate (Uitslag)
- **Nu**: `bg-black/65` -- redelijk maar scores kunnen beter
- **Straks**: naar `bg-black/70`, text-shadow op scores en teamnamen

### PreviewTemplate (Voorbeschouwing)
- **Nu**: `bg-black/65`
- **Straks**: naar `bg-black/70`, text-shadow

### MatchdayTemplate (Speelronde)
- **Nu**: `bg-black/65`
- **Straks**: naar `bg-black/70`, text-shadow

### StandingsTemplate (Stand)
- **Nu**: `bg-black/75` -- al sterk
- **Straks**: text-shadow toevoegen voor consistentie

### PlayerHighlightTemplate (Speler)
- **Nu**: gradient bottom-up, bovenkant is zwak
- **Straks**: base overlay `bg-black/40` toevoegen naast de gradient, text-shadow

### QuoteTemplate (Citaat)
- **Nu**: gradient 70%-50%-80%
- **Straks**: gradient versterken naar 75%-60%-85%, text-shadow

### BreakingTemplate (Breaking)
- **Nu**: gradient bottom-up, bovenkant zwak
- **Straks**: base overlay `bg-black/40` toevoegen, text-shadow

### StatTemplate (Statistiek)
- **Nu**: radial gradient 50%-80%
- **Straks**: radial gradient versterken naar 60%-85%, text-shadow op het grote getal

### PollTemplate (Poll)
- **Nu**: gradient 70%-40%-75%
- **Straks**: gradient versterken naar 75%-55%-80%, text-shadow

## Technische details

### Bestanden die wijzigen (10 template-bestanden):
- `src/components/visuals/templates/GamedayTemplate.tsx`
- `src/components/visuals/templates/ResultTemplate.tsx`
- `src/components/visuals/templates/PreviewTemplate.tsx`
- `src/components/visuals/templates/MatchdayTemplate.tsx`
- `src/components/visuals/templates/StandingsTemplate.tsx`
- `src/components/visuals/templates/PlayerHighlightTemplate.tsx`
- `src/components/visuals/templates/QuoteTemplate.tsx`
- `src/components/visuals/templates/BreakingTemplate.tsx`
- `src/components/visuals/templates/StatTemplate.tsx`
- `src/components/visuals/templates/PollTemplate.tsx`

### Specifieke aanpassing GamedayTemplate
De rode "MATCHDAY" tekst wordt wit met een rood streepje erboven, zodat het leesbaar blijft over elke foto. Dit volgt het patroon van de rode top-bar die al in alle templates zit.

### Geen nieuwe dependencies
Alleen CSS-aanpassingen: `textShadow` inline styles en sterkere overlay-waarden.
