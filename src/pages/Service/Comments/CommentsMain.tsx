import React from 'react';
import { Comment } from '../../../store/type';
import SingleComment from './SingleComment';
import { useTranslation } from "react-i18next";

interface CommentsMainProps {
  comments: Comment[];
   refetch: () => void; 
}

const CommentsMain: React.FC<CommentsMainProps> = ({ comments, refetch}) => {
   const { t } = useTranslation();
 
  return (
    <div className="mb-6">
      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {comments.length ? (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <SingleComment key={index} comment={comment} onCommentUpdated={refetch} />
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">
                           {t("no_comments")}

          </p>
        )}
      </div>
    </div>
  );
};

export default CommentsMain;
