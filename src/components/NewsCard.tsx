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

interface NewsCardProps {
  article: Article;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  return (
    <article 
      className="card-premium dark:bg-gray-800 dark:border-gray-700 overflow-hidden w-full group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden w-full">
        <OptimizedImage 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {article.isBreaking && (
          <div className="absolute top-2 left-2 animate-pulse">
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
              🔥 Breaking
            </span>
          </div>
        )}
        <span className="absolute top-2 right-2 bg-az-red/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
          {article.category}
        </span>
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="font-headline text-lg font-semibold text-foreground leading-snug line-clamp-2 mb-2">
          {article.title}
        </h2>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {article.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </article>
  );
};
