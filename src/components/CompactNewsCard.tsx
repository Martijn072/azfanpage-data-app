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

interface CompactNewsCardProps {
  article: Article;
}

export const CompactNewsCard = ({ article }: CompactNewsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  return (
    <article 
      className="flex gap-3 p-3 rounded-lg border-l-2 border-az-red bg-card dark:bg-gray-800 cursor-pointer transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-gray-700/50"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-[100px] aspect-square overflow-hidden rounded-lg">
        <OptimizedImage 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-headline text-base font-semibold text-foreground leading-snug line-clamp-2 mb-1">
          {article.title}
        </h3>
        
        {/* Meta - only date */}
        <span className="text-xs text-muted-foreground">
          {article.publishedAt}
        </span>
      </div>
    </article>
  );
};
