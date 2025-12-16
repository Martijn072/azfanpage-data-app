
export interface WordPressPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  author: number;
  date: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{ name: string }>;
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ name: string; taxonomy: string }>>;
  };
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string; // ISO format for filtering
  publishedAt: string; // Relative format for display
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  readTime: string;
}
