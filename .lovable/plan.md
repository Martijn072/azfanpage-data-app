
# Embeddable Widgets voor AZ Fanpage Artikelen

## Concept

Standalone, iframe-vriendelijke widgets die op azfanpage.nl in WordPress-artikelen ingebed kunnen worden. Elke widget laadt zijn eigen data, heeft een transparante/donkere achtergrond die past bij de site, en is responsive.

## Welke embeds zijn waardevol in artikelen?

### 1. Eredivisie Stand (compact)
- Perfecte aanvulling bij elk competitie-gerelateerd artikel
- Toont top 5 + AZ-positie (als die buiten top 5 valt)
- Live data, altijd actueel

### 2. Wedstrijdscore / Uitslagkaart
- Voor wedstrijdverslagen: toont de eindstand met logo's
- Kan gekoppeld worden aan een specifieke fixture ID

### 3. Volgende Wedstrijd
- Voor voorbeschouwingen: toont tegenstander, tijd, locatie, countdown
- Altijd de eerstvolgende AZ-wedstrijd

### 4. Head-to-Head balk
- Voor voorbeschouwingen: visuele W-G-V verdeling tegen de volgende tegenstander
- Compacte horizontale balk

### 5. Wedstrijdstatistieken
- Voor nabeschouwingen: xG, balbezit, schoten etc.
- Gekoppeld aan een specifieke fixture ID

## Technische aanpak

### Nieuwe embed-routes (zonder AppLayout)

Aparte routes onder `/embed/...` die GEEN sidebar/topbar laden, alleen de widget zelf:

```text
/embed/standings          - Compacte Eredivisie stand
/embed/last-match         - Laatste uitslagkaart
/embed/next-match         - Volgende wedstrijd
/embed/h2h                - Head-to-head volgende tegenstander
/embed/match-stats/:id    - Statistieken van specifieke wedstrijd
```

### Embed wrapper component

Een `EmbedLayout` component die:
- Donkere achtergrond instelt (passend bij azfanpage.nl)
- Padding toevoegt
- Geen navigatie/sidebar toont
- Een klein "Powered by AZ Fanpage" voetje toont

### WordPress integratie

Op azfanpage.nl kan elk widget ingebed worden met een simpele iframe:

```text
<iframe 
  src="https://alkmaar-red-report.lovable.app/embed/standings" 
  width="100%" 
  height="400" 
  frameborder="0"
/>
```

## Bestanden

| Actie | Bestand | Beschrijving |
|-------|---------|-------------|
| Nieuw | `src/components/embed/EmbedLayout.tsx` | Wrapper: donker thema, padding, geen navigatie |
| Nieuw | `src/pages/embed/EmbedStandings.tsx` | Compacte stand widget |
| Nieuw | `src/pages/embed/EmbedLastMatch.tsx` | Laatste uitslag widget |
| Nieuw | `src/pages/embed/EmbedNextMatch.tsx` | Volgende wedstrijd widget |
| Nieuw | `src/pages/embed/EmbedH2H.tsx` | Head-to-head balk |
| Nieuw | `src/pages/embed/EmbedMatchStats.tsx` | Wedstrijdstatistieken (per fixture ID) |
| Wijzig | `src/App.tsx` | Embed-routes toevoegen buiten AppLayout |

Bestaande componenten (`StandingsWidget`, `LastMatchCard`, `NextMatchCard`, `H2HVisualBar`, `StatComparisonBars`) worden hergebruikt -- er wordt geen logica gedupliceerd.
