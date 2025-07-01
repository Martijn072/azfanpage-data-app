
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddComment, CommentFormData } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export const CommentForm = ({ 
  articleId, 
  parentId, 
  onSuccess, 
  placeholder = "Deel je mening over dit artikel...",
  compact = false 
}: CommentFormProps) => {
  const [formData, setFormData] = useState<CommentFormData>({
    content: '',
    parent_id: parentId,
  });
  
  const { isAuthenticated } = useAuth();
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      return;
    }

    if (!isAuthenticated) {
      alert('Je moet ingelogd zijn om te reageren');
      return;
    }

    try {
      await addComment.mutateAsync({
        articleId,
        commentData: formData,
      });
      
      setFormData({
        content: '',
        parent_id: parentId,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-4 bg-premium-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-premium-gray-600 dark:text-gray-300">
          Je moet ingelogd zijn om te reageren.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="bg-white dark:bg-gray-800 border-premium-gray-300 dark:border-gray-600 focus:border-az-red dark:focus:border-az-red min-h-[120px] resize-none pr-12"
          required
        />
        <Button
          type="submit"
          disabled={addComment.isPending || !formData.content.trim()}
          className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-az-red hover:bg-red-700 text-white rounded-full"
        >
          {addComment.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {!compact && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-premium-gray-600 dark:text-gray-400">
            Gebruik het nieuwe beveiligde comment systeem
          </p>
          <p className="text-sm text-premium-gray-600 dark:text-gray-400">
            {formData.content.length}/2000 tekens
          </p>
        </div>
      )}
    </form>
  );
};
