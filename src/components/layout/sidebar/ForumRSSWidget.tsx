import { useState, useEffect } from 'react';
import { MessageSquare, Clock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  link: string;
}

export const ForumRSSWidget = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for now since RSS feed couldn't be accessed
    // In production, this would fetch from an RSS parser API
    const mockPosts: ForumPost[] = [
      {
        id: '1',
        title: 'AZ tegen PSV - Vooruitblik',
        author: 'AZFan2024',
        publishedAt: '2 uur geleden',
        link: '/forum/topic/1'
      },
      {
        id: '2',
        title: 'Transferperiode discussie',
        author: 'Alkmaars',
        publishedAt: '4 uur geleden',
        link: '/forum/topic/2'
      },
      {
        id: '3',
        title: 'Meeus speelt geweldig dit seizoen',
        author: 'VanhetKasteel',
        publishedAt: '6 uur geleden',
        link: '/forum/topic/3'
      },
      {
        id: '4',
        title: 'Conference League kansen',
        author: 'EuropaAZ',
        publishedAt: '8 uur geleden',
        link: '/forum/topic/4'
      },
      {
        id: '5',
        title: 'AFAS Stadion ervaring',
        author: 'StadionGanger',
        publishedAt: '10 uur geleden',
        link: '/forum/topic/5'
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePostClick = (postId: string) => {
    navigate('/forum');
  };

  const handleViewAllClick = () => {
    navigate('/forum');
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-az-red" />
          <h3 className="text-lg font-bold text-foreground">Laatste Discussies</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-az-red" />
          <h3 className="text-lg font-bold text-foreground">Laatste Discussies</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-medium text-foreground group-hover:text-az-red transition-colors text-sm line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.publishedAt}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={handleViewAllClick}
          className="w-full mt-4 flex items-center justify-center gap-2 p-2 text-sm font-medium text-az-red hover:bg-az-red/5 rounded-lg transition-colors"
        >
          Bekijk alle discussies
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};