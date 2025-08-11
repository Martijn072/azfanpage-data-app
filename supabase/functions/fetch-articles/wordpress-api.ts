import { WordPressPost, WordPressCategory, Article } from './types.ts';
import { formatPublishedDate, cleanHtmlContent, getExcludedCategoryIds } from './utils.ts';

export const fetchWordPressCategories = async (): Promise<WordPressCategory[]> => {
  try {
    const response = await fetch('https://azfanpage.nl/wp-json/wp/v2/categories?per_page=100', {
      headers: { 'User-Agent': 'AZFanpage-App/1.0' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status);
      return [];
    }
    
    const categories: WordPressCategory[] = await response.json();
    console.log(`Fetched ${categories.length} categories from WordPress`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const transformPost = (post: WordPressPost): Article => {
  const author = post._embedded?.author?.[0]?.name || 'AZFanpage Redactie';
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop';
  
  // Get category name from embedded terms
  const categoryTerms = post._embedded?.['wp:term']?.find(termGroup => 
    termGroup.some(term => term.taxonomy === 'category')
  );
  const category = categoryTerms?.find(term => term.taxonomy === 'category')?.name || 'Nieuws';
  
  // Check if it's breaking news - only based on explicit 'breaking' tag
  const tagTerms = post._embedded?.['wp:term']?.find(termGroup => 
    termGroup.some(term => term.taxonomy === 'post_tag')
  );
  const tags = tagTerms?.filter(term => term.taxonomy === 'post_tag').map(term => term.name) || [];
  const isBreaking = tags.some(tag => 
    tag.toLowerCase().includes('breaking')
  );

  // Clean excerpt HTML
  const excerpt = cleanHtmlContent(post.excerpt.rendered);
  const publishedAt = formatPublishedDate(post.date);

  return {
    id: post.id,
    slug: post.slug,
    title: cleanHtmlContent(post.title.rendered),
    excerpt: excerpt,
    content: post.content.rendered, // Full content for article detail
    author: author,
    publishedAt: publishedAt,
    imageUrl: featuredImage,
    category: category,
    isBreaking: isBreaking,
    readTime: `${Math.ceil(post.content.rendered.split(' ').length / 200)} min`
  };
};

export const fetchWordPressArticles = async (
  page: number,
  perPage: number,
  search: string,
  categoryId?: number
) => {
  // Build query parameters
  const queryParams = new URLSearchParams({
    '_embed': 'true',
    'per_page': perPage.toString(),
    'page': page.toString(),
    'orderby': 'date',
    'order': 'desc'
  });

  // Add search parameter if provided
  if (search) {
    queryParams.append('search', search);
    console.log(`Search query: ${search}`);
  }

  // Add category filter if provided
  if (categoryId) {
    queryParams.append('categories', categoryId.toString());
    console.log(`Using category ID ${categoryId}`);
  }

  // Always exclude the "Ingezonden" category (ID 2477)
  const excludedIds = getExcludedCategoryIds();
  if (excludedIds.length > 0) {
    queryParams.append('categories_exclude', excludedIds.join(','));
    console.log(`Excluding category IDs: ${excludedIds.join(',')}`);
  }

  const response = await fetch(
    `https://azfanpage.nl/wp-json/wp/v2/posts?${queryParams.toString()}`,
    {
      headers: {
        'User-Agent': 'AZFanpage-App/1.0',
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch from WordPress API:', response.status, response.statusText);
    throw new Error(`WordPress API returned ${response.status}`);
  }

  // Get total count from headers
  const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');

  const posts: WordPressPost[] = await response.json();
  console.log(`Successfully fetched ${posts.length} articles for page ${page}`);

  const articles = posts.map(transformPost);

  return {
    articles,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalPosts: totalPosts,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

export const fetchSingleWordPressArticle = async (articleIdentifier: string) => {
  console.log(`Fetching single article ${articleIdentifier} from azfanpage.nl WordPress API...`);
  
  // Check if identifier is numeric (ID) or text (slug)
  const isNumericId = /^\d+$/.test(articleIdentifier);
  
  let url: string;
  if (isNumericId) {
    url = `https://azfanpage.nl/wp-json/wp/v2/posts/${articleIdentifier}?_embed`;
  } else {
    url = `https://azfanpage.nl/wp-json/wp/v2/posts?slug=${articleIdentifier}&_embed`;
  }
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AZFanpage-App/1.0',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch article from WordPress API:', response.status, response.statusText);
    throw new Error(`WordPress API returned ${response.status}`);
  }

  let post: WordPressPost;
  if (isNumericId) {
    post = await response.json();
  } else {
    const posts: WordPressPost[] = await response.json();
    if (!posts || posts.length === 0) {
      throw new Error(`Article with slug "${articleIdentifier}" not found`);
    }
    post = posts[0];
  }
  
  console.log(`Successfully fetched article ${articleIdentifier}`);
  return transformPost(post);
};
