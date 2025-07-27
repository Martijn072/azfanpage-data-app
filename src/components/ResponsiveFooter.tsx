import { useState, useEffect } from "react"
import { useScreenSize } from "@/hooks/use-responsive"

interface MenuItem {
  id: number
  title: string
  url: string
}

export function ResponsiveFooter() {
  const { isMobile, isTablet } = useScreenSize()
  const [partnersMenu, setPartnersMenu] = useState<MenuItem[]>([])
  const [vriendenMenu, setVriendenMenu] = useState<MenuItem[]>([])

  useEffect(() => {
    const fetchWordPressMenus = async () => {
      try {
        // Try to fetch WordPress menus
        const [partnersResponse, vriendenResponse] = await Promise.allSettled([
          fetch('https://azfanpage.nl/wp-json/wp-api-menus/v2/menus/partners'),
          fetch('https://azfanpage.nl/wp-json/wp-api-menus/v2/menus/vrienden')
        ])

        if (partnersResponse.status === 'fulfilled' && partnersResponse.value.ok) {
          const partnersData = await partnersResponse.value.json()
          setPartnersMenu(partnersData.items || [])
        } else {
          // Fallback for partners
          setPartnersMenu([
            { id: 1, title: "AZ Officiële Website", url: "https://www.az.nl" },
            { id: 2, title: "AFAS Stadium", url: "https://www.afasstadion.nl" },
            { id: 3, title: "AZ Shop", url: "https://shop.az.nl" }
          ])
        }

        if (vriendenResponse.status === 'fulfilled' && vriendenResponse.value.ok) {
          const vriendenData = await vriendenResponse.value.json()
          setVriendenMenu(vriendenData.items || [])
        } else {
          // Fallback for vrienden
          setVriendenMenu([
            { id: 1, title: "AZ Supporters", url: "https://www.azsupporters.nl" },
            { id: 2, title: "De Vriendschap", url: "https://devriendschap.nl" },
            { id: 3, title: "AZ Community", url: "https://community.az.nl" }
          ])
        }
      } catch (error) {
        console.error('Error fetching WordPress menus:', error)
        // Set fallback data on error
        setPartnersMenu([
          { id: 1, title: "AZ Officiële Website", url: "https://www.az.nl" },
          { id: 2, title: "AFAS Stadium", url: "https://www.afasstadion.nl" }
        ])
        setVriendenMenu([
          { id: 1, title: "AZ Supporters", url: "https://www.azsupporters.nl" },
          { id: 2, title: "De Vriendschap", url: "https://devriendschap.nl" }
        ])
      }
    }

    fetchWordPressMenus()
  }, [])

  const overAZFanpage = [
    { title: "Over ons", url: "/over" },
    { title: "Contact", url: "/contact" },
    { title: "Adverteren", url: "/adverteren" },
    { title: "Privacy beleid", url: "/privacy" },
    { title: "Algemene voorwaarden", url: "/voorwaarden" }
  ]

  const navigatie = [
    { title: "Actueel nieuws", url: "/" },
    { title: "Wedstrijdprogramma", url: "/az-programma" },
    { title: "Eredivisie stand", url: "/eredivisie" },
    { title: "AZ geschiedenis", url: "/over" },
    { title: "Forum", url: "/forum" }
  ]

  const getGridCols = () => {
    if (isMobile) return "grid-cols-1"
    if (isTablet) return "grid-cols-2"
    return "grid-cols-4"
  }

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className={`grid ${getGridCols()} gap-8`}>
          {/* Kolom 1: Over AZFanpage */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Over AZFanpage</h3>
            <ul className="space-y-2">
              {overAZFanpage.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 2: Navigatie */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Navigatie</h3>
            <ul className="space-y-2">
              {navigatie.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Partners */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Partners</h3>
            <ul className="space-y-2">
              {partnersMenu.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Vrienden */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Vrienden</h3>
            <ul className="space-y-2">
              {vriendenMenu.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AZFanpage. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  )
}