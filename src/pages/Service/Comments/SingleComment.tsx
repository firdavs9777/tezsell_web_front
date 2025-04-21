// components/SingleComment.tsx
import React from 'react';
import { Comment } from '@store/type';
import { FaUser } from 'react-icons/fa';
import { BASE_URL } from '@store/constants';


interface SingleCommentProps {
  comment: Comment;
}

const SingleComment: React.FC<SingleCommentProps> = ({ comment }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-start mb-3">
        <div className="mr-3 w-10 h-10 flex-shrink-0">
          {comment.user.profile_image != null ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={`${BASE_URL}/${comment.user.profile_image.image}`}
                alt={comment.user.username}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUser className="text-gray-500" size={16} />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {comment.user.username}
          </p>
          <p className="text-sm text-gray-500">
            {comment.user.location
              ? `${comment.user.location.region}, ${comment.user.location.district}`
              : ""}
          </p>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {new Date(comment.created_at).toLocaleString()}
        </div>
      </div>
      <p className="text-gray-700">{comment.text}</p>
    </div>
  );
};

export default SingleComment;
