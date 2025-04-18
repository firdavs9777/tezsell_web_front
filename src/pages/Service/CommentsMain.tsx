import React from 'react';
import { Comment } from '../../store/type';
import SingleComment from './SingleComment';

interface CommentsMainProps {
  comments: Comment[];
}

const CommentsMain: React.FC<CommentsMainProps> = ({ comments }) => {
  return (
    <div className="mb-6">
      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {comments.length ? (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <SingleComment key={index} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentsMain;
