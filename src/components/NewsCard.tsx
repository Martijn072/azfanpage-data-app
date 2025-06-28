
import { User } from "lucide-react";

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
  return (
    <article className="card-premium overflow-hidden animate-slide-up">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        {article.isBreaking && (
          <div className="absolute top-4 left-4">
            <span className="breaking-news">🔥 Breaking</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-premium-gray-700">
          {article.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="headline-premium text-headline-md mb-3 hover:text-az-red transition-colors cursor-pointer">
          {article.title}
        </h2>
        
        <p className="body-premium text-body-md text-premium-gray-600 mb-4 line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-premium-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </div>
      
      {/* Interaction strip */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between pt-4 border-t border-premium-gray-100">
          <button className="flex items-center gap-2 text-premium-gray-600 hover:text-az-red transition-colors">
            <span className="text-sm font-medium">Lees meer</span>
          </button>
          
          <div className="flex items-center gap-4 text-premium-gray-500">
            <button className="hover:text-az-red transition-colors">
              💬 12
            </button>
            <button className="hover:text-az-red transition-colors">
              🔗 Delen
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
