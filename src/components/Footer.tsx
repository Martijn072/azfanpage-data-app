import { ExternalLink, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">AZFanpage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dé plek voor alle AZ nieuws, wedstrijden en discussies. Gemaakt door fans, voor fans.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>info@azfanpage.nl</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Snelle Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/nieuws" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Laatste Nieuws
                </a>
              </li>
              <li>
                <a href="/programma" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Wedstrijdprogramma
                </a>
              </li>
              <li>
                <a href="/eredivisie" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Eredivisie Stand
                </a>
              </li>
              <li>
                <a href="/forum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Forum Discussies
                </a>
              </li>
            </ul>
          </div>

          {/* AZ Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">AZ Alkmaar</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.az.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Officiële Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://tickets.az.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Tickets
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://shop.az.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Fanshop
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="/spelers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Speler Statistieken
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Contact & Juridisch</h3>
            <ul className="space-y-2">
              <li>
                <a href="/over" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Over AZFanpage
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Beleid
                </a>
              </li>
              <li>
                <a href="/gebruiksvoorwaarden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Gebruiksvoorwaarden
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Alkmaar, Nederland</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 AZFanpage. Alle rechten voorbehouden.
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <a 
              href="https://072design.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Powered by 072DESIGN
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};