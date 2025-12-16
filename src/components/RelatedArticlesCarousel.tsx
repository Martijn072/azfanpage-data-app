import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedArticlesCarouselProps {
  currentArticleId: number;
  category: string;
}

export const RelatedArticlesCarousel = ({
  currentArticleId,
  category,
}: RelatedArticlesCarouselProps) => {
  const { data, isLoading } = useArticles(1, 7, "", category);

  // Filter out current article and limit to 6
  const relatedArticles = data?.articles
    ?.filter((article) => article.id !== currentArticleId)
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="mt-10">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-64 h-48 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Meer uit {category}
      </h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: relatedArticles.length > 3,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {relatedArticles.map((article) => (
            <CarouselItem
              key={article.id}
              className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-1/3"
            >
              <Link
                to={`/artikel/${article.id}`}
                className="block group"
              >
                <div className="overflow-hidden rounded-lg bg-card border border-border transition-shadow hover:shadow-md">
                  {/* Image */}
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <Badge
                      variant="secondary"
                      className="mb-2 text-xs font-medium"
                    >
                      {article.category}
                    </Badge>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-az-red transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {relatedArticles.length > 3 && (
          <>
            <CarouselPrevious className="hidden sm:flex -left-4 bg-background border-border" />
            <CarouselNext className="hidden sm:flex -right-4 bg-background border-border" />
          </>
        )}
      </Carousel>
    </div>
  );
};
