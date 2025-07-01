
import React, { useState } from 'react';
import { Send, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddSecureComment } from '@/hooks/useSecureComments';
import { useAuth } from '@/hooks/useAuth';

interface SecureCommentFormProps {
  articleId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  compact?: boolean;
  onAuthRequired?: () => void;
}

export const SecureCommentForm = ({ 
  articleId, 
  parentId, 
  onSuccess, 
  placeholder = "Deel je mening over dit artikel...",
  compact = false,
  onAuthRequired
}: SecureCommentFormProps) => {
  const [content, setContent] = useState('');
  const { user, isAuthenticated } = useAuth();
  const addComment = useAddSecureComment();

  // Get user IP (in real implementation, this would come from server)
  const getUserIP = () => {
    // This is a simplified approach - in production you'd get this from your backend
    return '127.0.0.1';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      await addComment.mutateAsync({
        articleId,
        commentData: {
          content: content.trim(),
          parent_id: parentId,
        },
        userIpAddress: getUserIP(),
      });
      
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const characterCount = content.length;
  const maxLength = 2000;
  const isNearLimit = characterCount > maxLength * 0.8;

  if (!isAuthenticated) {
    return (
      <div className="bg-premium-gray-50 dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <Shield className="w-8 h-8 text-premium-gray-400 mx-auto mb-2" />
        <p className="text-premium-gray-600 dark:text-gray-300 mb-3">
          Je moet ingelogd zijn om te reageren
        </p>
        <Button 
          onClick={onAuthRequired}
          className="bg-az-red hover:bg-red-700 text-white"
        >
          Inloggen / Registreren
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-white dark:bg-gray-800 border-premium-gray-300 dark:border-gray-600 focus:border-az-red dark:focus:border-az-red min-h-[120px] resize-none pr-12"
          maxLength={maxLength}
          required
        />
        <Button
          type="submit"
          disabled={addComment.isPending || !content.trim() || characterCount > maxLength}
          className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-az-red hover:bg-red-700 text-white rounded-full"
        >
          {addComment.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-premium-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Beveiligd comment systeem</span>
          </div>
          
          {parentId && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Reactie op comment</span>
            </div>
          )}
        </div>
        
        <div className={`text-xs ${isNearLimit ? 'text-red-600 dark:text-red-400' : 'text-premium-gray-500 dark:text-gray-400'}`}>
          {characterCount}/{maxLength} tekens
        </div>
      </div>

      <div className="text-xs text-premium-gray-500 dark:text-gray-400 space-y-1">
        <p>• Houd je aan de huisregels en wees respectvol</p>
        <p>• Nieuwe accounts: eerste 3 reacties worden gemodereerd</p>
        <p>• Limiet: 5 reacties per 10 minuten</p>
      </div>
    </form>
  );
};
