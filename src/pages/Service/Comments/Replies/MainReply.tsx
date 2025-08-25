import SingleReply from "@services/Comments/Replies/SingleReply";
import { Reply } from "@services/Comments/SingleComment";
import React from "react";

interface MainReplyProps {
  replies: Reply[];
  showReplies?: boolean;
  onReplyUpdate?: () => void;
  onReplyDelete?: () => void;
}

const MainReply: React.FC<MainReplyProps> = ({
  replies,
  onReplyUpdate,
  onReplyDelete
}) => {
  return (
    <div className="mt-3 pl-6 border-l-2 border-gray-100">
      {replies?.map((reply) => (
        <SingleReply
          key={reply.id}
          reply={reply}
          onReplyUpdate={onReplyUpdate}
          onReplyDelete={onReplyDelete}
        />
      ))}
    </div>
  );
};

export default MainReply;
