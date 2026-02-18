

# AZ Fanpage Data App — Fase 0: Strip en Fundament

Dit is een grote ombouwoperatie. De huidige publiekssite wordt getransformeerd naar een **redactie-dashboard** voor data-analyse, visual-generatie en artikelpublicatie. We beginnen met Fase 0: het fundament leggen.

---

## Wat blijft behouden

De volledige API-laag en data-logica blijft intact:

- `src/utils/footballApiClient.ts` -- de centrale API-caller
- `src/utils/seasonUtils.ts` -- seizoensberekening
- `src/types/footballApi.ts` -- alle type definities
- Alle data hooks: `useFixtureHooks`, `useStandingHooks`, `useTeamHooks`, `useTeamStatistics`, `useFixtureEvents`, `useFixtureLineups`, `useTeamFixtures`, `useFootballApi`, `useLeagueId`, `useJongAZHooks`, `useEuropeanParticipation`
- `src/integrations/supabase/client.ts` -- Supabase connectie
- `supabase/functions/football-api/` -- de Edge Function proxy
- Bestaande UI component library (`src/components/ui/`) -- wordt hergebruikt met nieuwe styling

---

## Wat wordt verwijderd

Alle website-specifieke code:

- Alle pagina's in `src/pages/` (Index, News, ArticleDetail, Standen, etc.)
- Website-componenten: Header, BottomNavigation, NewsCard, HeroNewsCard, SearchOverlay, CategoryFilter, ForumWidget, DisqusComments, ShareBar, SocialMediaPromo, etc.
- SEO/PWA-specifieke code: CanonicalTag, InstallPromptBanner, manifest, service worker
- WordPress content-rendering en artikelcache
- Notification systeem en Disqus integratie
- FontSizeContext en FontSizeToggle (niet relevant voor een dashboard)
- Website-specifieke hooks: useArticles, useSearchArticles, useForumRSS, useSocialMediaPosts, useDisqusComments, etc.

---

## Stap-voor-stap implementatie

### Stap 1 -- Design System tokens implementeren

Nieuw dark-mode kleurenpalet in `src/index.css` en `tailwind.config.ts`:

| Token | Kleur | Gebruik |
|-------|-------|---------|
| `app-bg` | `#0F1117` | Hoofdachtergrond |
| `app-surface` | `#1A1D27` | Cards, panels, sidebar |
| `app-surface-hover` | `#22252F` | Hover states |
| `app-surface-elevated` | `#252830` | Modals, dropdowns |
| `app-border` | `#2A2D37` | Subtiele borders |
| `app-border-strong` | `#3A3D47` | Benadrukte borders |

Semantische kleuren voor data:
- `success` (#22C55E), `warning` (#F59E0B), `danger` (#EF4444), `info` (#3B82F6)
- Chart-kleuren: `chart-az` (#DB0021), `chart-opponent` (#6B7280), accenten

Typografie wordt compacter (dashboard-optimized):
- Body text: 14px (was 18-19px op de site)
- JetBrains Mono toegevoegd voor data/cijfers
- Outfit + Plus Jakarta Sans blijven (al geladen)

### Stap 2 -- App Shell: Sidebar + Layout

Nieuwe layout-structuur ter vervanging van de huidige Header + BottomNavigation:

```text
+--------------------------------------------------+
| Top Bar (48px) -- Logo, breadcrumb, user          |
+----------+---------------------------------------+
|          |                                        |
| Sidebar  |  Main Content Area                     |
| (240px)  |  max-width: 1200px                     |
|          |  padding: 24px                          |
| Collapse |                                        |
| = 64px   |  +----------+ +----------+             |
|          |  |  Card     | |  Card    |             |
|          |  |  p: 16px  | |  p: 16px |             |
|          |  +----------+ +----------+             |
|          |                                        |
+----------+---------------------------------------+
```

Nieuwe bestanden:
- `src/components/layout/AppLayout.tsx` -- hoofdlayout met sidebar + content area
- `src/components/layout/Sidebar.tsx` -- navigatie sidebar (240px/64px collapsed)
- `src/components/layout/TopBar.tsx` -- breadcrumb, logo, gebruiker

Sidebar navigatie-items:
- Dashboard (home)
- Wedstrijden (lijst + analyse)
- Voorbeschouwing
- Nabeschouwing
- Competitie (stand, context)
- Spelers (vergelijkingen)
- Visuals (later)
- Editor (later)
- Instellingen (later)

### Stap 3 -- Routing herstructureren

`App.tsx` wordt volledig herschreven:

| Route | Pagina | Beschrijving |
|-------|--------|-------------|
| `/` | Dashboard | Eerstvolgende + laatste wedstrijd + stand |
| `/wedstrijden` | WedstrijdLijst | Gespeelde en geplande wedstrijden |
| `/wedstrijden/:id` | WedstrijdAnalyse | Statistieken, tijdlijn, opstelling |
| `/voorbeschouwing` | Voorbeschouwing | Data voor aankomende wedstrijd |
| `/nabeschouwing` | Nabeschouwing | Analyse van laatste wedstrijd |
| `/competitie` | Competitie | Standen, context, trends |
| `/spelers` | Spelers | Statistieken en vergelijkingen |

### Stap 4 -- Dashboard pagina (eerste werkende view)

De dashboard-pagina hergebruikt bestaande hooks:
- `useNextAZFixture(201)` voor eerstvolgende wedstrijd
- `useAZFixtures(201, 1)` voor laatste wedstrijd
- `useEredivisieStandings()` voor top-5 stand

Nieuwe componenten:
- `src/pages/app/Dashboard.tsx`
- `src/components/dashboard/NextMatchCard.tsx` -- countdown + quick-link
- `src/components/dashboard/LastMatchCard.tsx` -- score + quick-link nabeschouwing
- `src/components/dashboard/StandingsWidget.tsx` -- compacte top-5 Eredivisie

### Stap 5 -- index.html en metadata opschonen

- Verwijder SEO meta tags (noindex wordt behouden)
- Verwijder Open Graph en Twitter tags
- Verwijder JSON-LD structured data
- Verwijder Google Analytics (interne tool)
- Verwijder PWA service worker registratie
- Titel aanpassen: "AZ Fanpage Data App"
- JetBrains Mono font toevoegen aan Google Fonts link
- Theme-color aanpassen naar dark: `#0F1117`

---

## Technische details

### Bestanden die worden aangemaakt (nieuw)
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/pages/app/Dashboard.tsx`
- `src/components/dashboard/NextMatchCard.tsx`
- `src/components/dashboard/LastMatchCard.tsx`
- `src/components/dashboard/StandingsWidget.tsx`

### Bestanden die worden aangepast
- `tailwind.config.ts` -- nieuwe kleurtokens, compactere typografie, spacing tokens
- `src/index.css` -- volledig nieuw dark-mode design system (website-CSS wordt gestript)
- `src/App.tsx` -- nieuwe routing, AppLayout wrapper, verwijder website-providers
- `index.html` -- metadata opschonen, JetBrains Mono toevoegen

### Bestanden die worden verwijderd
- Alle website-pagina's (`src/pages/Index.tsx`, `News.tsx`, `ArticleDetail.tsx`, etc.)
- Website-componenten (Header, BottomNavigation, NewsCard, HeroNewsCard, etc.)
- Website-specifieke hooks (useArticles, useSearchArticles, useForumRSS, etc.)
- Website-specifieke contexts (FontSizeContext, DarkModeContext wordt vereenvoudigd)
- SEO-componenten (CanonicalTag)
- PWA-componenten (InstallPromptBanner, OfflineIndicator)

### Bestanden die behouden blijven (ongewijzigd)
- `src/utils/footballApiClient.ts`
- `src/utils/seasonUtils.ts`
- `src/types/footballApi.ts`
- `src/integrations/supabase/client.ts`
- `src/hooks/useFixtureHooks.ts`
- `src/hooks/useStandingHooks.ts`
- `src/hooks/useTeamHooks.ts`
- `src/hooks/useTeamStatistics.ts`
- `src/hooks/useFixtureEvents.ts`
- `src/hooks/useFixtureLineups.ts`
- `src/hooks/useTeamFixtures.ts`
- `src/hooks/useLeagueId.ts`
- `src/hooks/useJongAZHooks.ts`
- `src/hooks/useEuropeanParticipation.ts`
- `supabase/functions/football-api/`
- `src/components/ui/*` (UI primitives worden hergebruikt)

---

## Resultaat na Fase 0

Een werkende app-shell met:
- Donker thema als default (professional tool look)
- Sidebar navigatie met alle module-links
- Dashboard met eerstvolgende wedstrijd, laatste resultaat en top-5 stand
- Alle bestaande API-Football data beschikbaar via behouden hooks
- Klaar als fundament voor Fase 1 (wedstrijd-analyse, statistieken views)

