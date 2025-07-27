import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, Twitter, Facebook } from "lucide-react"

export function SocialMediaSidebar() {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/azfanpage/",
      color: "text-pink-600 hover:text-pink-700"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      url: "https://twitter.com/azfanpage",
      color: "text-blue-500 hover:text-blue-600"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://www.facebook.com/azfanpage",
      color: "text-blue-600 hover:text-blue-700"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Volg Ons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {socialLinks.map((social) => (
          <Button
            key={social.name}
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <social.icon className={`w-5 h-5 ${social.color}`} />
              <span>{social.name}</span>
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}