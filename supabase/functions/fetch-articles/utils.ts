
export const getCategoryIdByName = (categories: any[], categoryName: string): number | null => {
  // Create mapping for common category variations
  const categoryMappings: { [key: string]: string[] } = {
    'Wedstrijdverslag': ['Wedstrijdverslag', 'Wedstrijden', 'Match Report'],
    'Transfer': ['Transfer', 'Transfers'],
    'Jeugd': ['Jeugd', 'Youth', 'Jeugdteams'],
    'Interviews': ['Interviews', 'Interview'],
    'Nieuws': ['Nieuws', 'News', 'Algemeen']
  };

  // First try exact match
  let category = categories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  // If no exact match, try mapped variations
  if (!category) {
    const variations = categoryMappings[categoryName] || [categoryName];
    for (const variation of variations) {
      category = categories.find(cat => 
        cat.name.toLowerCase().includes(variation.toLowerCase()) ||
        cat.slug.toLowerCase().includes(variation.toLowerCase())
      );
      if (category) break;
    }
  }

  return category?.id || null;
};

export const formatPublishedDate = (dateString: string): string => {
  const publishedDate = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return 'Zojuist';
  } else if (diffHours < 24) {
    return `${diffHours} uur geleden`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? '1 dag geleden' : `${diffDays} dagen geleden`;
  }
};

export const cleanHtmlContent = (htmlString: string): string => {
  return htmlString
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .trim();
};
