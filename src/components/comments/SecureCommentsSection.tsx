
import React, { useState } from 'react';
import { MessageCircle, Users, SortAsc, SortDesc, Search, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSecureComments } from '@/hooks/useSecureComments';
import { SecureCommentCard } from './SecureCommentCard';
import { SecureCommentForm } from './SecureCommentForm';
import { useAuth } from '@/hooks/useAuth';

interface SecureCommentsSectionProps {
  articleId: string;
  title: string;
  onAuthRequired?: () => void;
}

export const SecureCommentsSection = ({ 
  articleId, 
  title, 
  onAuthRequired 
}: SecureCommentsSectionProps) => {
  const { comments, isLoading, error } = useSecureComments(articleId);
  const { isAuthenticated } = useAuth();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const filteredAndSortedComments = React.useMemo(() => {
    let filtered = comments;

    // Filter by search term
    if (searchTerm) {
      filtered = comments.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user_profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user_profiles?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort comments
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_liked':
          return (b.likes_count - b.dislikes_count) - (a.likes_count - a.dislikes_count);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [comments, searchTerm, sortOrder]);

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Fout bij laden van reacties
        </h3>
        <p className="text-red-500 dark:text-red-400">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="headline-premium text-sm text-green-900 dark:text-green-100 font-semibold mb-1">
              Veilig Comment Systeem Actief
            </h4>
            <p className="body-premium text-xs text-green-800 dark:text-green-200">
              Dit nieuwe systeem beschermt tegen spam, zorgt voor rate limiting en heeft geavanceerde moderatie tools. 
              Alle comments worden beveiligd opgeslagen en gemodereerd.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-az-red flex-shrink-0" />
          <h3 className="headline-premium text-xl text-az-black dark:text-white font-bold">
            Reacties
          </h3>
          {totalComments > 0 && (
            <Badge variant="secondary" className="bg-az-red text-white text-sm px-3 py-1 font-medium">
              {totalComments}
            </Badge>
          )}
        </div>
        
        <Button
          onClick={() => {
            if (!isAuthenticated) {
              onAuthRequired?.();
            } else {
              setShowCommentForm(!showCommentForm);
            }
          }}
          className="bg-az-red hover:bg-red-700 text-white px-4 py-2 font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {isAuthenticated ? 'Reageren' : 'Inloggen om te reageren'}
        </Button>
      </div>

      {/* Comment Form */}
      {showCommentForm && isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-6">
          <h4 className="headline-premium text-lg mb-4 text-az-black dark:text-white font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-az-red" />
            Deel je mening
          </h4>
          <SecureCommentForm
            articleId={articleId}
            onSuccess={() => setShowCommentForm(false)}
            onAuthRequired={onAuthRequired}
          />
        </div>
      )}

      {/* Controls */}
      {comments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {totalComments} reactie{totalComments !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-premium-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Beveiligd
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400" />
                <Input
                  placeholder="Zoeken in reacties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-48 h-9 text-sm bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600"
                />
              </div>
              
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <SortDesc className="w-4 h-4" />
                      <span>Nieuwste</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-4 h-4" />
                      <span>Oudste</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="most_liked">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Populairste</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-az-red mx-auto"></div>
          <p className="mt-4 body-premium text-sm text-premium-gray-600 dark:text-gray-400">
            Beveiligde reacties laden...
          </p>
        </div>
      ) : filteredAndSortedComments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700">
          <MessageCircle className="w-16 h-16 text-premium-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="headline-premium text-lg mb-2 text-premium-gray-600 dark:text-gray-400 font-semibold">
            {searchTerm ? 'Geen reacties gevonden' : 'Nog geen reacties'}
          </h4>
          <p className="body-premium text-sm text-premium-gray-500 dark:text-gray-500 mb-6">
            {searchTerm 
              ? 'Probeer een andere zoekterm.' 
              : 'Wees de eerste om veilig te reageren op dit artikel!'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  onAuthRequired?.();
                } else {
                  setShowCommentForm(true);
                }
              }}
              className="bg-az-red hover:bg-red-700 text-white px-6 py-3"
            >
              <Shield className="w-4 h-4 mr-2" />
              {isAuthenticated ? 'Eerste reactie plaatsen' : 'Inloggen om te reageren'}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedComments.map((comment) => (
            <SecureCommentCard
              key={comment.id}
              comment={comment}
              articleId={articleId}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}
    </div>
  );
};
