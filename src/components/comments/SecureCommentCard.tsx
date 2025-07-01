
import React, { useState } from 'react';
import { Heart, MessageCircle, Flag, MoreVertical, Pin, Shield, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { SecureComment, useCommentReaction, useReportComment } from '@/hooks/useSecureComments';
import { SecureCommentForm } from './SecureCommentForm';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface SecureCommentCardProps {
  comment: SecureComment;
  articleId: string;
  depth?: number;
  onAuthRequired?: () => void;
}

export const SecureCommentCard = ({ 
  comment, 
  articleId, 
  depth = 0, 
  onAuthRequired 
}: SecureCommentCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  
  const { isAuthenticated } = useAuth();
  const commentReaction = useCommentReaction();
  const reportComment = useReportComment();

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    try {
      await commentReaction.mutateAsync({
        commentId: comment.id,
        reactionType,
      });
    } catch (error) {
      console.error('Error reacting to comment:', error);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (!reportReason) return;

    try {
      await reportComment.mutateAsync({
        commentId: comment.id,
        reason: reportReason,
        description: reportDescription,
      });
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  const maxDepth = 3;
  const shouldShowReplies = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-4 md:ml-8 border-l-2 border-premium-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <article className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-4 mb-4 hover:shadow-sm transition-shadow">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={comment.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_profiles?.username}`}
              alt={comment.user_profiles?.display_name || comment.user_profiles?.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="headline-premium text-sm text-az-black dark:text-white font-semibold">
                  {comment.user_profiles?.display_name || comment.user_profiles?.username}
                </h4>
                
                {comment.user_profiles?.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-1.5 py-0.5">
                    <Shield className="w-3 h-3 mr-1" />
                    Geverifieerd
                  </Badge>
                )}
                
                <div className="flex items-center gap-1 text-xs text-premium-gray-500 dark:text-gray-400">
                  <span>Rep: {comment.user_profiles?.reputation || 0}</span>
                </div>
              </div>
              
              <p className="text-xs text-premium-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: nl,
                })}
                {comment.is_edited && (
                  <span className="ml-2 text-premium-gray-400">• bewerkt</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {comment.is_pinned && (
              <Pin className="w-4 h-4 text-az-red" />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Flag className="w-4 h-4 mr-2" />
                      Rapporteer
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comment rapporteren</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Reden</label>
                        <Select value={reportReason} onValueChange={setReportReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer reden" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spam">Spam</SelectItem>
                            <SelectItem value="harassment">Intimidatie</SelectItem>
                            <SelectItem value="inappropriate">Ongepast</SelectItem>
                            <SelectItem value="misinformation">Desinformatie</SelectItem>
                            <SelectItem value="other">Anders</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Beschrijving (optioneel)</label>
                        <Textarea
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          placeholder="Geef meer details..."
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleReport} disabled={!reportReason}>
                          Rapporteer
                        </Button>
                        <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                          Annuleer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-4">
          <p className="body-premium text-premium-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          
          {comment.spam_score > 0.5 && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              ⚠️ Deze reactie is gemarkeerd voor mogelijke spam
            </div>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-2 h-8 px-3 rounded-full transition-colors ${
              comment.user_reaction === 'like'
                ? 'text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
                : 'text-premium-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${comment.user_reaction === 'like' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{comment.likes_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('dislike')}
            className={`flex items-center gap-2 h-8 px-3 rounded-full transition-colors ${
              comment.user_reaction === 'dislike'
                ? 'text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'text-premium-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${comment.user_reaction === 'dislike' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{comment.dislikes_count}</span>
          </Button>

          {shouldShowReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-2 h-8 px-3 rounded-full text-premium-gray-600 dark:text-gray-400 hover:text-az-red hover:bg-az-red/10"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Reageren {comment.reply_count > 0 && `(${comment.reply_count})`}
              </span>
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && shouldShowReplies && (
          <div className="mt-4 pt-4 border-t border-premium-gray-200 dark:border-gray-700">
            <SecureCommentForm
              articleId={articleId}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              placeholder={`Reageer op ${comment.user_profiles?.display_name || comment.user_profiles?.username}...`}
              compact={true}
              onAuthRequired={onAuthRequired}
            />
          </div>
        )}
      </article>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && shouldShowReplies && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <SecureCommentCard
              key={reply.id}
              comment={reply}
              articleId={articleId}
              depth={depth + 1}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}

      {/* Max depth reached message */}
      {comment.replies && comment.replies.length > 0 && !shouldShowReplies && (
        <div className="ml-4 text-sm text-premium-gray-500 dark:text-gray-400 italic">
          Meer antwoorden... (maximale diepte bereikt)
        </div>
      )}
    </div>
  );
};
