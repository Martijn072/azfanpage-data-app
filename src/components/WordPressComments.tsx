
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WordPressCommentsProps {
  articleId: string;
}

export const WordPressComments = ({ articleId }: WordPressCommentsProps) => {
  return (
    <div className="text-center py-8 bg-premium-gray-50 dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700">
      <MessageCircle className="w-12 h-12 text-premium-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h4 className="headline-premium text-lg mb-2 text-premium-gray-600 dark:text-gray-400 font-semibold">
        WordPress Comments Disabled
      </h4>
      <p className="body-premium text-sm text-premium-gray-500 dark:text-gray-500">
        Dit component is vervangen door het nieuwe beveiligde comment systeem.
      </p>
    </div>
  );
};
