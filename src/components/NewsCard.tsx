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
      className="card-premium overflow-hidden w-full group transition-shadow duration-300 hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden w-full">
        <OptimizedImage 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
        {article.isBreaking && (
          <div className="absolute top-2 left-2 animate-pulse">
            <span className="bg-az-red text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
              🔥 Breaking
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-az-red/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold text-white shadow-lg">
          {article.category}
        </div>
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="font-headline text-base font-semibold mb-2 line-clamp-2 text-foreground transition-colors duration-300">
          {article.title}
        </h2>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta info - simplified */}
        <p className="text-xs text-muted-foreground">
          {article.author} • {article.publishedAt}
        </p>
      </div>
    </article>
  );
};
