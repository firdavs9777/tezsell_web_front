import React from 'react';
import { FaUser } from 'react-icons/fa';

interface SingleReplyProps {
  reply: {
    id: string;
    text: string;
    created_at: string;
    user: {
      username: string;
      profile_image?: { image: string } | null;
      location?: { region: string; district: string } | null;
    };
  };
}

const SingleReply: React.FC<SingleReplyProps> = ({ reply }) => {
  return (
    <div className="mt-3 bg-gray-50 rounded-lg p-3">
      <div className="flex items-start mb-2">
        <div className="mr-2 w-8 h-8 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <FaUser className="text-gray-500" size={12} />
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {reply.user.username}
          </p>
          <p className="text-xs text-gray-500">
            {reply.user.location
              ? `${reply.user.location.region}, ${reply.user.location.district}`
              : ""}
          </p>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {new Date(reply.created_at).toLocaleString()}
        </div>
      </div>
      <p className="text-gray-700 text-sm pl-10">{reply.text}</p>
    </div>
  );
};

export default SingleReply;
