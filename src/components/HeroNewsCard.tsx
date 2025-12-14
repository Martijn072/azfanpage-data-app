import { useNavigate } from "react-router-dom";
import { articleCache } from "@/services/articleCache";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  readTime: string;
}

interface HeroNewsCardProps {
  article: Article;
}

export const HeroNewsCard = ({ article }: HeroNewsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  return (
    <article 
      className="relative w-full overflow-hidden rounded-xl cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image with aspect ratio */}
      <div className="aspect-[4/3] lg:aspect-[16/9] overflow-hidden">
        <OptimizedImage 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Category pill - top left */}
      <div className="absolute top-3 left-3">
        <span className="bg-az-red text-white px-2.5 py-1 rounded-full text-xs font-medium">
          {article.category}
        </span>
      </div>

      {/* Breaking badge - top right */}
      {article.isBreaking && (
        <div className="absolute top-3 right-3 animate-pulse">
          <span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            🔥 Breaking
          </span>
        </div>
      )}

      {/* Content overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
        <h2 className="font-headline text-2xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight line-clamp-3 mb-2">
          {article.title}
        </h2>
        
        {/* Excerpt - hidden on mobile, 1 line on desktop */}
        <p className="hidden lg:block text-white/80 text-base line-clamp-1 mb-3">
          {article.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </article>
  );
};
