import React from "react";
import { useTranslation } from "react-i18next";
import { FiX, FiCornerUpLeft } from "react-icons/fi";
import { Message, SingleMessage } from "@store/slices/chatSlice";

interface ReplyPreviewProps {
  replyingTo: SingleMessage | Message;
  onCancel: () => void;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyingTo, onCancel }) => {
  const { t } = useTranslation();

  const senderName =
    typeof replyingTo.sender === "object"
      ? replyingTo.sender.username
      : t("user") || "User";

  const getPreviewContent = () => {
    if (replyingTo.is_deleted) {
      return t("message_deleted") || "This message was deleted";
    }
    if (replyingTo.message_type === "image") {
      return `📷 ${t("photo") || "Photo"}`;
    }
    if (replyingTo.message_type === "voice") {
      return `🎤 ${t("voice_message") || "Voice message"}`;
    }
    return replyingTo.content;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
        <FiCornerUpLeft size={16} />
      </div>

      <div className="flex-1 border-l-2 border-blue-500 pl-3 overflow-hidden">
        <div className="text-sm font-medium text-blue-600">
          {t("replying_to") || "Replying to"} {senderName}
        </div>
        <div className="text-sm text-gray-600 truncate">{getPreviewContent()}</div>
      </div>

      <button
        onClick={onCancel}
        className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
        title={t("cancel_reply") || "Cancel reply"}
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export default ReplyPreview;
