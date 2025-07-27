import { NewsCard } from "@/components/NewsCard"

interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  publishedAt: string
  imageUrl: string
  category: string
  isBreaking: boolean
  readTime: string
}

interface ResponsiveArticleGridProps {
  articles: Article[]
}

export function ResponsiveArticleGrid({ articles }: ResponsiveArticleGridProps) {
  const getPatternType = (index: number) => {
    const patternIndex = index % 3
    return patternIndex === 0 ? 'hero' : patternIndex === 1 ? 'double' : 'triple'
  }

  const getArticlesByPattern = () => {
    const patterns: Array<{ type: string; articles: Article[] }> = []
    let currentIndex = 0

    while (currentIndex < articles.length) {
      const patternType = getPatternType(Math.floor(currentIndex / (currentIndex === 0 ? 1 : currentIndex === 1 ? 2 : 3)))
      
      if (patternType === 'hero') {
        patterns.push({
          type: 'hero',
          articles: articles.slice(currentIndex, currentIndex + 1)
        })
        currentIndex += 1
      } else if (patternType === 'double') {
        patterns.push({
          type: 'double',
          articles: articles.slice(currentIndex, currentIndex + 2)
        })
        currentIndex += 2
      } else {
        patterns.push({
          type: 'triple',
          articles: articles.slice(currentIndex, currentIndex + 3)
        })
        currentIndex += 3
      }
    }

    return patterns
  }

  const patterns = getArticlesByPattern()

  return (
    <div className="space-y-8">
      {patterns.map((pattern, patternIndex) => (
        <div key={patternIndex} className="animate-fade-in" style={{ animationDelay: `${patternIndex * 0.1}s` }}>
          {pattern.type === 'hero' && (
            <div className="grid grid-cols-1">
              {pattern.articles.map((article) => (
                <div key={article.id} className="transform hover:scale-[1.02] transition-all duration-300">
                  <NewsCard article={article} variant="hero" />
                </div>
              ))}
            </div>
          )}
          
          {pattern.type === 'double' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pattern.articles.map((article) => (
                <div key={article.id} className="transform hover:scale-[1.02] transition-all duration-300">
                  <NewsCard article={article} variant="medium" />
                </div>
              ))}
            </div>
          )}
          
          {pattern.type === 'triple' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pattern.articles.map((article) => (
                <div key={article.id} className="transform hover:scale-[1.02] transition-all duration-300">
                  <NewsCard article={article} variant="small" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}