import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "@store/index";
import { SingleMessage } from "@store/slices/chatSlice";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend, FiSmile, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";

interface MainChatWindowProps {
  messages: SingleMessage[];
  isLoading: boolean;
  chatId: number;
  error?: FetchBaseQueryError | SerializedError | undefined;
  onSendMessage: (content: string) => void;
  isConnected?: boolean;
}

const MainChatWindow: React.FC<MainChatWindowProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  isConnected = false,
}) => {
  const userId = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info?.id || ""
  );
  const currentUsername = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info?.username || ""
  );

  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    url: string;
    type: "image" | "audio" | "video" | "file";
    file: File;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !filePreview) return;

    try {
      await onSendMessage(newMessage);
      setNewMessage("");
      setFilePreview(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
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

  const allMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-full">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
              <p className="text-red-600 font-semibold">Error loading chat</p>
              <p className="text-sm text-gray-600 mt-1">
                Please try again later
              </p>
            </div>
          </div>
        )}

        {allMessages.map((msg: SingleMessage, index: number) => {
          let isMyMessage = false;

          if (typeof msg.sender === "object" && msg.sender?.id) {
            isMyMessage = msg.sender.id === userId;
          } else if (typeof msg.sender === "number") {
            isMyMessage = msg.sender === userId;
          } else if (typeof msg.sender === "object" && msg.sender?.username) {
            isMyMessage = msg.sender.username === currentUsername;
          }

          return (
            <div
              key={msg.id || `msg-${index}`}
              className={`flex ${
                isMyMessage ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`group max-w-[85%] sm:max-w-md md:max-w-lg px-4 py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                  isMyMessage
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                }`}
              >
                {msg.file && (
                  <div className="mb-2">
                    {msg.file.type === "image" ? (
                      <img
                        src={msg.file.url}
                        alt="Uploaded content"
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : msg.file.type === "audio" ? (
                      <audio controls className="w-full">
                        <source src={msg.file.url} type="audio/*" />
                      </audio>
                    ) : (
                      <a
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:underline"
                      >
                        Download file
                      </a>
                    )}
                  </div>
                )}

                <div className="text-sm md:text-base leading-relaxed break-words">
                  {msg.content}
                </div>

                <div
                  className={`flex items-center gap-2 mt-2 text-xs ${
                    isMyMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  <span className="font-medium">
                    {isMyMessage
                      ? "You"
                      : typeof msg.sender === "object"
                      ? msg.sender.username
                      : "User"}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

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
            <span>Reconnecting to chat server...</span>
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
            title="Add emoji"
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
            title="Attach file"
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
              onChange={(e) => setNewMessage(e.target.value)}
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
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
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
            title="Send message"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainChatWindow;
