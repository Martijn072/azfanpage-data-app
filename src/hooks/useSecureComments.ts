
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SecureComment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  content_html: string | null;
  is_approved: boolean;
  is_pinned: boolean;
  is_edited: boolean;
  edit_count: number;
  last_edited_at: string | null;
  likes_count: number;
  dislikes_count: number;
  reports_count: number;
  is_hidden: boolean;
  hidden_reason: string | null;
  spam_score: number;
  reply_count: number;
  depth: number;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    reputation: number;
    is_verified: boolean;
  } | null;
  replies?: SecureComment[];
  user_reaction?: 'like' | 'dislike' | null;
}

export interface SecureCommentFormData {
  content: string;
  parent_id?: string;
}

export const useSecureComments = (articleId: string) => {
  const { toast } = useToast();
  
  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['secure-comments', articleId],
    queryFn: async () => {
      console.log('🔍 Fetching secure comments for article:', articleId);
      
      const { data, error } = await supabase
        .from('secure_comments')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            avatar_url,
            reputation,
            is_verified
          )
        `)
        .eq('article_id', articleId)
        .eq('is_approved', true)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching secure comments:', error);
        throw error;
      }
      
      console.log('✅ Secure comments fetched:', data);
      
      // Get user reactions if logged in
      const { data: { user } } = await supabase.auth.getUser();
      let userReactions: any[] = [];
      
      if (user && data && data.length > 0) {
        const { data: reactions } = await supabase
          .from('comment_reactions')
          .select('comment_id, reaction_type')
          .eq('user_id', user.id)
          .in('comment_id', data.map(c => c.id));
        
        userReactions = reactions || [];
      }
      
      // Organize comments with replies and user reactions
      const organizedComments = organizeCommentsWithReplies(
        data as any[] || [], 
        userReactions
      );
      
      return organizedComments;
    },
  });

  return {
    comments,
    isLoading,
    error,
  };
};

export const useAddSecureComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      articleId, 
      commentData, 
      userIpAddress 
    }: { 
      articleId: string; 
      commentData: SecureCommentFormData;
      userIpAddress?: string;
    }) => {
      console.log('💬 Adding secure comment:', commentData);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Je moet ingelogd zijn om te reageren');
      }

      // Check rate limit
      if (userIpAddress) {
        const { data: canComment } = await supabase.rpc('check_rate_limit', {
          p_user_id: user.id,
          p_ip_address: userIpAddress,
          p_action_type: 'comment',
          p_max_actions: 5,
          p_window_minutes: 10
        });

        if (!canComment) {
          throw new Error('Je hebt de limiet van 5 reacties per 10 minuten bereikt');
        }
      }

      // Check account age (24 hours)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('account_created_at')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const accountAge = new Date().getTime() - new Date(profile.account_created_at).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (accountAge < oneDayMs) {
          throw new Error('Je account moet minimaal 24 uur oud zijn om te reageren');
        }
      }

      // Basic spam detection
      const spamKeywords = ['spam', 'casino', 'viagra', 'buy now', 'click here'];
      const contentLower = commentData.content.toLowerCase();
      const spamScore = spamKeywords.reduce((score, keyword) => {
        return contentLower.includes(keyword) ? score + 0.2 : score;
      }, 0);

      // Calculate depth for nested replies
      let depth = 0;
      if (commentData.parent_id) {
        const { data: parentComment } = await supabase
          .from('secure_comments')
          .select('depth')
          .eq('id', commentData.parent_id)
          .single();
        
        depth = parentComment ? Math.min(parentComment.depth + 1, 3) : 0;
      }

      const { data, error } = await supabase
        .from('secure_comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: commentData.content,
          parent_id: commentData.parent_id || null,
          spam_score: spamScore,
          depth: depth,
          is_approved: spamScore < 0.3, // Auto-approve if low spam score
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding secure comment:', error);
        throw error;
      }

      // Record rate limit action
      if (userIpAddress) {
        await supabase.rpc('record_rate_limit_action', {
          p_user_id: user.id,
          p_ip_address: userIpAddress,
          p_action_type: 'comment'
        });
      }

      console.log('✅ Secure comment added:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secure-comments', variables.articleId] });
      
      if (data.is_approved) {
        toast({
          title: "Reactie geplaatst",
          description: "Je reactie is succesvol toegevoegd!",
          className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
        });
      } else {
        toast({
          title: "Reactie wacht op goedkeuring",
          description: "Je reactie wordt beoordeeld door moderators.",
          className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Error in add secure comment mutation:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon reactie niet plaatsen. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
};

export const useCommentReaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      reactionType 
    }: { 
      commentId: string; 
      reactionType: 'like' | 'dislike' 
    }) => {
      console.log('👍 Managing comment reaction:', commentId, reactionType);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Je moet ingelogd zijn om te reageren');
      }

      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('id, reaction_type')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if same type
          const { error } = await supabase
            .from('comment_reactions')
            .delete()
            .eq('id', existingReaction.id);

          if (error) throw error;
          return { action: 'removed', type: reactionType };
        } else {
          // Update reaction if different type
          const { error } = await supabase
            .from('comment_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);

          if (error) throw error;
          return { action: 'updated', type: reactionType };
        }
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
        return { action: 'added', type: reactionType };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-comments'] });
    },
    onError: (error: any) => {
      console.error('❌ Error managing reaction:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon reactie niet verwerken.",
        variant: "destructive",
      });
    },
  });
};

export const useReportComment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      reason, 
      description 
    }: { 
      commentId: string; 
      reason: string; 
      description?: string 
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Je moet ingelogd zijn om te rapporteren');
      }

      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          description,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rapport verzonden",
        description: "Bedankt voor je melding. We bekijken deze zo snel mogelijk.",
        className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error reporting comment:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon rapport niet versturen.",
        variant: "destructive",
      });
    },
  });
};

// Helper function to organize comments with replies
const organizeCommentsWithReplies = (
  comments: any[], 
  userReactions: any[]
): SecureComment[] => {
  const commentMap = new Map<string, SecureComment>();
  const rootComments: SecureComment[] = [];

  // Create reaction map for quick lookup
  const reactionMap = new Map<string, string>();
  userReactions.forEach(reaction => {
    reactionMap.set(reaction.comment_id, reaction.reaction_type);
  });

  // Initialize all comments in map with user reactions
  comments.forEach(comment => {
    const commentWithReaction: SecureComment = {
      ...comment,
      replies: [],
      user_reaction: reactionMap.get(comment.id) as 'like' | 'dislike' | null || null
    };
    commentMap.set(comment.id, commentWithReaction);
  });

  // Organize replies
  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies!.push(commentMap.get(comment.id)!);
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  // Sort replies by creation date
  const sortReplies = (comments: SecureComment[]) => {
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        sortReplies(comment.replies);
      }
    });
  };

  sortReplies(rootComments);
  return rootComments;
};
