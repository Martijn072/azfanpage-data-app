import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fetchWordPressCategories, fetchWordPressArticles, fetchSingleWordPressArticle } from './wordpress-api.ts';
import { getCategoryIdByName } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { articleId, page = 1, perPage = 20, search = '', category = '' } = body;

    // If articleId is provided, fetch single article
    if (articleId) {
      const article = await fetchSingleWordPressArticle(articleId);

      return new Response(
        JSON.stringify({ article }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Otherwise, fetch list of articles with pagination and search
    console.log(`Fetching articles from azfanpage.nl WordPress API... Page: ${page}, Per page: ${perPage}`);
    
    let categoryId: number | undefined;

    // Handle category filtering with proper WordPress API integration
    if (category && category !== 'Alle' && category !== '') {
      console.log(`Category filter requested: ${category}`);
      
      // Fetch categories to get the correct ID
      const categories = await fetchWordPressCategories();
      const foundCategoryId = getCategoryIdByName(categories, category);
      
      if (foundCategoryId) {
        categoryId = foundCategoryId;
        console.log(`Using category ID ${categoryId} for category "${category}"`);
      } else {
        console.log(`Category "${category}" not found in WordPress, proceeding without category filter`);
      }
    }

    const result = await fetchWordPressArticles(page, perPage, search, categoryId);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching articles:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch articles',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
