import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiCornerUpLeft,
  FiMoreVertical
} from "react-icons/fi";
import { Message, SingleMessage } from "@store/slices/chatSlice";

// Common reactions like mobile app
const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageBubbleProps {
  message: SingleMessage | Message;
  isMyMessage: boolean;
  userId: number;
  onReply?: (message: SingleMessage | Message) => void;
  onEdit?: (messageId: number, content: string) => void;
  onDelete?: (messageId: number) => void;
  onReaction?: (messageId: number, emoji: string) => void;
  replyToMessage?: SingleMessage | Message | null;
  showReadReceipt?: boolean;
  isRead?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMyMessage,
  userId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  replyToMessage,
  showReadReceipt = true,
  isRead = false,
}) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
        setShowReactionPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if message is deleted
  if (message.is_deleted) {
    return (
      <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
        <div className="bg-gray-100 text-gray-500 italic px-4 py-2 rounded-2xl flex items-center gap-2">
          <FiTrash2 size={14} />
          <span>{t("message_deleted") || "This message was deleted"}</span>
        </div>
      </div>
    );
  }

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // Get reaction counts
  const reactionCounts = message.reactions || {};
  const hasReactions = Object.keys(reactionCounts).length > 0;

  // Check if user has reacted with specific emoji
  const hasUserReacted = (emoji: string) => {
    return reactionCounts[emoji]?.includes(userId);
  };

  // Check if this is an emoji-only message (for larger display)
  const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(message.content) && message.content.length <= 8;

  return (
    <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"} group`}>
      <div className="relative max-w-[85%] sm:max-w-md md:max-w-lg" ref={optionsRef}>
        {/* Reply Preview */}
        {replyToMessage && (
          <div
            className={`mb-1 px-3 py-1.5 rounded-lg text-xs border-l-2 ${
              isMyMessage
                ? "bg-blue-400/30 border-blue-300 text-blue-100"
                : "bg-gray-100 border-gray-400 text-gray-600"
            }`}
          >
            <span className="font-medium">
              {typeof replyToMessage.sender === "object"
                ? replyToMessage.sender.username
                : t("user")}
            </span>
            <p className="truncate opacity-80">
              {replyToMessage.content || t("photo") || "Photo"}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${
            isMyMessage
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
          } ${isEmojiOnly ? "!bg-transparent !shadow-none !border-none text-5xl" : ""}`}
        >
          {/* Editing Mode */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  {t("save") || "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* File/Image */}
              {message.file_url && (
                <div className="mb-2">
                  {message.message_type === "image" ? (
                    <img
                      src={message.file_url}
                      alt="Uploaded content"
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90"
                    />
                  ) : message.message_type === "voice" ? (
                    <audio controls className="w-full">
                      <source src={message.file_url} type="audio/*" />
                    </audio>
                  ) : (
                    <a
                      href={message.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:underline"
                    >
                      {t("download_file") || "Download file"}
                    </a>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className={`leading-relaxed break-words ${isEmojiOnly ? "" : "text-sm md:text-base"}`}>
                {message.content}
              </div>

              {/* Timestamp, Edited, Read Receipt */}
              <div
                className={`flex items-center gap-1.5 mt-2 text-xs ${
                  isMyMessage ? "text-blue-100" : "text-gray-500"
                }`}
              >
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {/* Edited indicator */}
                {message.is_edited && (
                  <span className="italic opacity-70">
                    {t("edited") || "edited"}
                  </span>
                )}

                {/* Read receipts (for own messages) */}
                {showReadReceipt && isMyMessage && (
                  <span className="ml-1">
                    {isRead ? (
                      <FiCheckCircle className="text-blue-200" size={14} />
                    ) : (
                      <FiCheck className="opacity-70" size={14} />
                    )}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reactions Display */}
        {hasReactions && !isEditing && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMyMessage ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionCounts).map(([emoji, userIds]) => (
              <button
                key={emoji}
                onClick={() => onReaction?.(message.id, emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-all ${
                  hasUserReacted(emoji)
                    ? "bg-blue-100 border-blue-300 border"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <span>{emoji}</span>
                <span className="text-xs text-gray-600">{userIds.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Message Options (visible on hover) */}
        <div
          className={`absolute top-0 ${isMyMessage ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"}
            opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
        >
          {/* Quick Reaction Button */}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-600"
            title={t("add_reaction") || "Add reaction"}
          >
            😀
          </button>

          {/* Reply Button */}
          <button
            onClick={() => onReply?.(message)}
            className="p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-600"
            title={t("reply") || "Reply"}
          >
            <FiCornerUpLeft size={14} />
          </button>

          {/* More Options (for own messages) */}
          {isMyMessage && (
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-600"
              title={t("more_options") || "More"}
            >
              <FiMoreVertical size={14} />
            </button>
          )}
        </div>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <div
            className={`absolute bottom-full mb-2 ${isMyMessage ? "right-0" : "left-0"}
              bg-white rounded-2xl shadow-xl p-2 flex gap-1 z-50 animate-fadeIn`}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction?.(message.id, emoji);
                  setShowReactionPicker(false);
                }}
                className={`text-xl p-1.5 hover:bg-gray-100 rounded-full transition-transform hover:scale-125 ${
                  hasUserReacted(emoji) ? "bg-blue-100" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Options Menu */}
        {showOptions && isMyMessage && (
          <div
            className={`absolute bottom-full mb-2 ${isMyMessage ? "right-0" : "left-0"}
              bg-white rounded-xl shadow-xl overflow-hidden z-50 min-w-[140px] animate-fadeIn`}
          >
            <button
              onClick={() => {
                setIsEditing(true);
                setShowOptions(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <FiEdit2 size={14} />
              {t("edit") || "Edit"}
            </button>
            <button
              onClick={() => {
                if (window.confirm(t("delete_confirmation") || "Delete this message?")) {
                  onDelete?.(message.id);
                }
                setShowOptions(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <FiTrash2 size={14} />
              {t("delete") || "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
