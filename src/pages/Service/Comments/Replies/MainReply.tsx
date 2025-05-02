import React from "react";
import SingleReply from "./SingleReply"; // make sure path is correct
import { Reply } from "../SingleComment";

interface MainReplyProps {
  replies: Reply[];
  showReplies?: boolean;
}

const MainReply: React.FC<MainReplyProps> = ({ replies }) => {
  return (
    <div className="mt-3 pl-6 border-l-2 border-gray-100">
      {replies?.map((reply) => (
        <SingleReply key={reply.id} reply={reply} />
      ))}
    </div>
  );
};

export default MainReply;
