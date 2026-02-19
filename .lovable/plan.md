
# Light Mode voor de Applicatie

## Wat gaat er gebeuren?

De hele app krijgt een schakelaar waarmee je kunt wisselen tussen licht en donker. Standaard wordt het systeem-thema van je apparaat gevolgd. De visuals-pagina (social media afbeeldingen) blijft altijd donker, want die zien er zo het beste uit.

## Zichtbare veranderingen

- Een zon/maan-icoontje rechts in de bovenste balk om te wisselen
- Alle pagina's, kaarten, tabellen en navigatie passen zich automatisch aan
- De lichte modus gebruikt de witte/grijze kleuren die al in het systeem zitten
- Visuals-pagina blijft altijd in dark mode

## Technisch plan

### 1. ThemeProvider toevoegen (App.tsx)
- `next-themes` is al geinstalleerd maar wordt alleen in Sonner gebruikt
- Wrap de app in `<ThemeProvider attribute="class" defaultTheme="system">`
- Verwijder de `useEffect` die altijd `dark` forceert

### 2. Thema-toggle in TopBar (TopBar.tsx)
- Voeg een Sun/Moon knop toe naast de seizoensselector
- Gebruikt `useTheme()` van `next-themes` om te wisselen

### 3. UI-componenten opschonen
De volgende bestanden gebruiken hardcoded kleuren (`premium-gray-*`, `az-black`, `dark:bg-gray-*`) die niet bestaan in het design system en problemen geven in light mode:

| Bestand | Aanpassing |
|---------|-----------|
| `select.tsx` | `bg-white dark:bg-gray-800 text-az-black` vervangen door `bg-popover text-popover-foreground` |
| `badge.tsx` | `premium-gray-*` en `dark:` varianten vervangen door `bg-secondary text-secondary-foreground` |
| `alert.tsx` | `premium-gray-200 dark:border-gray-700` vervangen door `border-border` |
| `button.tsx` | `premium-gray-300` vervangen door `border-input` |
| `skeleton.tsx` | `premium-gray-200` vervangen door `bg-muted` |
| `switch.tsx` | `premium-gray-300 dark:bg-gray-600` vervangen door `bg-input` |
| `navigation-menu.tsx` | Hardcoded kleuren vervangen door `bg-accent text-accent-foreground` |
| `toast.tsx` | Kleine `dark:` opruiming |

### 4. Visuals forceren naar dark mode (Visuals.tsx)
- Bij laden van de Visuals-pagina tijdelijk `dark` class toevoegen
- Bij verlaten terugzetten naar het gekozen thema
- Dit raakt alleen de Visuals-pagina, niet de rest van de app

### Bestanden die worden aangemaakt of gewijzigd

| Actie | Bestand |
|-------|---------|
| Wijzig | `src/App.tsx` |
| Wijzig | `src/components/layout/TopBar.tsx` |
| Wijzig | `src/components/ui/select.tsx` |
| Wijzig | `src/components/ui/badge.tsx` |
| Wijzig | `src/components/ui/alert.tsx` |
| Wijzig | `src/components/ui/button.tsx` |
| Wijzig | `src/components/ui/skeleton.tsx` |
| Wijzig | `src/components/ui/switch.tsx` |
| Wijzig | `src/components/ui/navigation-menu.tsx` |
| Wijzig | `src/components/ui/toast.tsx` |
| Wijzig | `src/pages/app/Visuals.tsx` |
