
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchArticle {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  category: string;
  readTime: string;
}

export const useSearchArticles = (searchQuery: string) => {
  return useQuery({
    queryKey: ['search-articles', searchQuery],
    queryFn: async (): Promise<SearchArticle[]> => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
      }

      console.log(`Searching articles for: "${searchQuery}"`);
      
      const { data, error } = await supabase.functions.invoke('fetch-articles', {
        body: { 
          page: 1, 
          perPage: 10, 
          search: searchQuery.trim(),
          category: '' 
        }
      });
      
      if (error) {
        console.error('Error searching articles:', error);
        throw new Error('Failed to search articles');
      }
      
      if (!data || !data.articles) {
        console.error('Invalid search response format:', data);
        return [];
      }
      
      console.log(`Found ${data.articles.length} articles for search: "${searchQuery}"`);
      return data.articles;
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
