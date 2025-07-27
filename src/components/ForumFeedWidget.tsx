import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

interface ForumPost {
  title: string
  author: string
  link: string
  pubDate: string
  description: string
}

export function ForumFeedWidget() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForumFeed = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Using a CORS proxy to fetch the RSS feed
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://azfanpage.nl/forum/feed')}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch forum feed')
        }
        
        const data = await response.json()
        const parser = new DOMParser()
        const xml = parser.parseFromString(data.contents, 'text/xml')
        
        const items = Array.from(xml.querySelectorAll('item')).slice(0, 5)
        const parsedPosts: ForumPost[] = items.map(item => ({
          title: item.querySelector('title')?.textContent || '',
          author: item.querySelector('creator, author')?.textContent || 'Onbekend',
          link: item.querySelector('link')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          description: item.querySelector('description')?.textContent || ''
        }))
        
        setPosts(parsedPosts)
      } catch (err) {
        console.error('Error fetching forum feed:', err)
        setError('Kon forumberichten niet laden')
        // Fallback mock data
        setPosts([
          {
            title: "Nieuwe aanwinst voor AZ?",
            author: "AZFan2024",
            link: "https://azfanpage.nl/forum",
            pubDate: new Date().toISOString(),
            description: "Discussie over mogelijke transfers"
          },
          {
            title: "Wedstrijdbespreking Conference League",
            author: "AlkmaarPride",
            link: "https://azfanpage.nl/forum",
            pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: "Hoe vonden jullie de wedstrijd?"
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchForumFeed()
    
    // Refresh every hour
    const interval = setInterval(fetchForumFeed, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Forum Discussies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Forum Discussies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <a
              key={index}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    door {post.author} • {formatDistanceToNow(new Date(post.pubDate), { 
                      addSuffix: true, 
                      locale: nl 
                    })}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </a>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {error || 'Geen forumberichten beschikbaar'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}