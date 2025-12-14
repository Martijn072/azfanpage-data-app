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
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="aspect-[4/3] lg:aspect-[16/9] overflow-hidden">
        <OptimizedImage 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Breaking Badge */}
      {article.isBreaking && (
        <div className="absolute top-4 right-4 animate-pulse z-10">
          <span className="bg-az-red text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
            🔥 BREAKING
          </span>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
        {/* Category Pill */}
        <span className="inline-block bg-az-red text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
          {article.category}
        </span>

        {/* Headline - larger sizes */}
        <h2 className="text-white font-headline text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight line-clamp-3 mb-3">
          {article.title}
        </h2>

        {/* Meta Info - simplified */}
        <p className="text-white/70 text-sm">
          {article.author} • {article.readTime} leestijd • {article.publishedAt}
        </p>
      </div>
    </article>
  );
};
