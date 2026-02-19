
# Logo met transparante achtergrond herstellen

## Probleem
Het huidige logobestand (`public/images/az-fanpage-logo.png`) heeft een witte achtergrond ingebakken in het bestand. Hierdoor verschijnt er een wit vierkant achter het logo in alle visuele templates.

## Oplossing
Het door jou geüploade transparante logobestand (`azfanpage-3.png`) wordt gekopieerd naar `public/images/az-fanpage-logo.png`, zodat het het huidige bestand overschrijft.

Alle 10 templates gebruiken al hetzelfde pad (`/images/az-fanpage-logo.png`), dus er hoeft verder niets aan de code te veranderen.

## Technisch detail
- Bestand: `user-uploads://azfanpage-3.png` wordt gekopieerd naar `public/images/az-fanpage-logo.png`
- Geen codewijzigingen nodig — alleen een bestandsvervanging
