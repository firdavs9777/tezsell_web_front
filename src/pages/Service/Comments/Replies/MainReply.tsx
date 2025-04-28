import React from 'react';
import SingleReply from './SingleReply'; // make sure path is correct

interface Reply {
  id: string;
  text: string;
  created_at: string;
  user: {
    username: string;
    profile_image?: { image: string } | null;
    location?: { region: string; district: string } | null;
  };
}

interface MainReplyProps {
  replies: Reply[];
  showReplies: boolean;
}

const MainReply: React.FC<MainReplyProps> = ({ replies, showReplies }) => {
  if (!showReplies || replies.length === 0) return null;

  return (
    <div className="mt-3 pl-6 border-l-2 border-gray-100">
      {replies.map((reply) => (
        <SingleReply key={reply.id} reply={reply} />
      ))}
    </div>
  );
};

export default MainReply;
