import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "@store/index";
import {
  SingleMessage,
  Message,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useToggleReactionMutation,
  useUpdateTypingStatusMutation,
} from "@store/slices/chatSlice";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FiPaperclip, FiSend, FiSmile, FiX, FiChevronDown } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import MessageBubble from "./MessageBubble";
import ReplyPreview from "./ReplyPreview";
import DateSeparator from "./DateSeparator";
import TypingIndicator from "./TypingIndicator";

interface MainChatWindowProps {
  messages: SingleMessage[];
  isLoading: boolean;
  chatId: number;
  error?: FetchBaseQueryError | SerializedError | undefined;
  onSendMessage: (content: string, replyTo?: number) => void;
  isConnected?: boolean;
  typingUsers?: string[];
}

// Helper to check if two dates are on different days
const isDifferentDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
};

const MainChatWindow: React.FC<MainChatWindowProps> = ({
  messages,
  isLoading,
  error,
  chatId,
  onSendMessage,
  isConnected = false,
  typingUsers = [],
}) => {
  const { t } = useTranslation();
  const userId = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info?.id || 0
  );
  const currentUsername = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info?.username || ""
  );
  const token = useSelector(
    (state: RootState) => state.auth.userInfo?.token || ""
  );

  // Mutations
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [updateTypingStatus] = useUpdateTypingStatusMutation();

  // State
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<SingleMessage | Message | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    url: string;
    type: "image" | "audio" | "video" | "file";
    file: File;
  } | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll position to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Typing indicator logic
  const handleTyping = useCallback(() => {
    if (!token || !chatId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    updateTypingStatus({ chatId: chatId.toString(), is_typing: true, token });

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus({ chatId: chatId.toString(), is_typing: false, token });
    }, 3000);
  }, [chatId, token, updateTypingStatus]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !filePreview) return;

    try {
      await onSendMessage(newMessage, replyingTo?.id);
      setNewMessage("");
      setFilePreview(null);
      setReplyingTo(null);

      // Clear typing status
      if (token && chatId) {
        updateTypingStatus({ chatId: chatId.toString(), is_typing: false, token });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("file_size_error") || "File size should be less than 10MB");
      return;
    }

    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
      ? "audio"
      : file.type.startsWith("video/")
      ? "video"
      : "file";

    setFilePreview({
      url: URL.createObjectURL(file),
      type: fileType,
      file: file,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const removeFilePreview = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
    }
  };

  // Message actions
  const handleReply = (message: SingleMessage | Message) => {
    setReplyingTo(message);
  };

  const handleEdit = async (messageId: number, content: string) => {
    try {
      await editMessage({
        chatId: chatId.toString(),
        messageId,
        content,
        token,
      }).unwrap();
      toast.success(t("message_edited") || "Message edited");
    } catch (error) {
      toast.error(t("edit_failed") || "Failed to edit message");
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      await deleteMessage({
        chatId: chatId.toString(),
        messageId,
        token,
      }).unwrap();
      toast.success(t("message_deleted_success") || "Message deleted");
    } catch (error) {
      toast.error(t("delete_failed") || "Failed to delete message");
    }
  };

  const handleReaction = async (messageId: number, emoji: string) => {
    try {
      await toggleReaction({
        chatId: chatId.toString(),
        messageId,
        emoji,
        token,
      }).unwrap();
    } catch (error) {
      toast.error(t("reaction_failed") || "Failed to add reaction");
    }
  };

  // Check if message is from current user
  const isMyMessage = (msg: SingleMessage) => {
    if (typeof msg.sender === "object" && msg.sender?.id) {
      return msg.sender.id === userId;
    }
    if (typeof msg.sender === "object" && msg.sender?.username) {
      return msg.sender.username === currentUsername;
    }
    return false;
  };

  // Get reply message from messages array
  const getReplyToMessage = (replyToId: number | Message | null | undefined) => {
    if (!replyToId) return null;
    if (typeof replyToId === "object") return replyToId;
    return messages.find((m) => m.id === replyToId) || null;
  };

  const allMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">
                {t("loading_messages") || "Loading messages..."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-full">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
              <p className="text-red-600 font-semibold">
                {t("error_loading_chat") || "Error loading chat"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t("try_again_later") || "Please try again later"}
              </p>
            </div>
          </div>
        )}

        {allMessages.map((msg, index) => {
          const prevMsg = index > 0 ? allMessages[index - 1] : null;
          const currentDate = new Date(msg.timestamp);
          const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;
          const showDateSeparator = !prevDate || isDifferentDay(currentDate, prevDate);

          return (
            <React.Fragment key={msg.id || `msg-${index}`}>
              {showDateSeparator && <DateSeparator date={currentDate} />}
              <MessageBubble
                message={msg}
                isMyMessage={isMyMessage(msg)}
                userId={userId}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReaction={handleReaction}
                replyToMessage={getReplyToMessage(msg.reply_to)}
                showReadReceipt={true}
                isRead={true}
              />
            </React.Fragment>
          );
        })}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} isVisible={typingUsers.length > 0} />

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-32 right-8 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200 z-10"
          title={t("scroll_to_bottom") || "Scroll to bottom"}
        >
          <FiChevronDown size={20} className="text-gray-600" />
        </button>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <ReplyPreview replyingTo={replyingTo} onCancel={() => setReplyingTo(null)} />
      )}

      {/* File Preview */}
      {filePreview && (
        <div className="mx-4 md:mx-6 lg:mx-8 mb-2">
          <div className="relative inline-block bg-white border-2 border-blue-500 rounded-xl p-3 shadow-lg">
            {filePreview.type === "image" ? (
              <img
                src={filePreview.url}
                alt="Preview"
                className="max-w-[200px] max-h-[200px] rounded-lg"
              />
            ) : filePreview.type === "audio" ? (
              <audio controls className="max-w-[300px]">
                <source src={filePreview.url} type="audio/*" />
              </audio>
            ) : (
              <div className="flex items-center gap-2 px-2">
                <FiPaperclip className="text-gray-600" />
                <span className="truncate max-w-[200px] text-sm">
                  {filePreview.file.name}
                </span>
              </div>
            )}
            <button
              onClick={removeFilePreview}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 md:px-6 lg:px-8 shadow-lg">
        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg animate-pulse">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>{t("reconnecting") || "Reconnecting to chat server..."}</span>
          </div>
        )}

        {/* Input Container */}
        <div className="flex items-end gap-2 relative">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-xl overflow-hidden"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={window.innerWidth < 640 ? 280 : 350}
                height={400}
              />
            </div>
          )}

          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-full transition-all ${
              isConnected
                ? "text-gray-600 hover:text-yellow-500 hover:bg-yellow-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
            disabled={!isConnected}
            title={t("add_emoji") || "Add emoji"}
          >
            <FiSmile size={22} />
          </button>

          {/* File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-full transition-all ${
              isConnected
                ? "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
            disabled={!isConnected}
            title={t("attach_file") || "Attach file"}
          >
            <FiPaperclip size={22} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,audio/*,video/*"
            className="hidden"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (e.target.value.length === 1) {
                  handleTyping();
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (newMessage.trim() || filePreview) &&
                  isConnected
                ) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isConnected
                  ? t("type_message") || "Type a message..."
                  : t("connecting") || "Connecting..."
              }
              className="w-full px-4 py-3 pr-12 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading || !isConnected}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className={`p-3 rounded-full transition-all shadow-md ${
              (newMessage.trim() || filePreview) && isConnected
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg scale-100 hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={
              (!newMessage.trim() && !filePreview) || isLoading || !isConnected
            }
            title={t("send_message") || "Send message"}
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainChatWindow;
