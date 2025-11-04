import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "@store/index";
import { SingleChat } from "@store/slices/chatSlice";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend, FiSmile } from "react-icons/fi";
import { useSelector } from "react-redux";

interface MainChatWindowProps {
  messages: SingleChat;
  isLoading: boolean;
  chatId: number;
  error?: FetchBaseQueryError | SerializedError | undefined;
  onSendMessage: (content: string) => void;
  isConnected?: boolean; // Add this prop
}

const MainChatWindow: React.FC<MainChatWindowProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  isConnected = false, // Default to false
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !filePreview) {
      return;
    }

    try {
      // Send message via the parent component's handler
      await onSendMessage(newMessage);

      // Clear input after successful send
      setNewMessage("");
      setFilePreview(null);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., 5MB limit)
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

    // Clear the input to allow selecting the same file again
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

  // Get all messages from props (already combined in MainChat)
  const allMessages = messages?.messages || [];

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300">
      {/* Connection Status Indicator */}
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-xs text-gray-600">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading && <p className="text-gray-400">Loading messages...</p>}
        {error && <p className="text-red-500">Error loading chat</p>}

        {allMessages.map((msg, index) => {
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
              }`}
            >
              <div
                className={`max-w-[300px] sm:max-w-md px-4 py-2 rounded-lg text-sm shadow ${
                  isMyMessage
                    ? "bg-blue-100 text-right"
                    : "bg-green-200 text-left"
                }`}
              >
                {msg.file && (
                  <div className="mb-2">
                    {msg.file.type === "image" ? (
                      <img
                        src={msg.file.url}
                        alt="Uploaded content"
                        className="max-w-full h-auto rounded"
                      />
                    ) : msg.file.type === "audio" ? (
                      <div className="bg-gray-100 p-2 rounded">
                        <audio controls className="w-full">
                          <source src={msg.file.url} type="audio/*" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <a
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Download file
                      </a>
                    )}
                  </div>
                )}
                <div className="mb-1">{msg.content}</div>
                <div className="text-xs text-gray-600 flex justify-between gap-2">
                  <span>
                    {isMyMessage
                      ? "You"
                      : typeof msg.sender === "object"
                      ? msg.sender.username
                      : "Other user"}
                  </span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File preview */}
      {filePreview && (
        <div className="relative mb-2 p-2 bg-gray-100 rounded-lg">
          {filePreview.type === "image" ? (
            <img
              src={filePreview.url}
              alt="Preview"
              className="max-w-[200px] h-auto rounded"
            />
          ) : filePreview.type === "audio" ? (
            <audio controls className="w-full">
              <source src={filePreview.url} type="audio/*" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[200px]">
                {filePreview.file.name}
              </span>
            </div>
          )}
          <button
            onClick={removeFilePreview}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input Area */}
      <div className="mt-4 flex gap-2 border-t pt-4 relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-600 hover:text-blue-500"
          disabled={!isConnected}
        >
          <FiSmile size={20} />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-10">
            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-600 hover:text-blue-500"
          disabled={!isConnected}
        >
          <FiPaperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,audio/*,video/*"
          className="hidden"
        />

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (newMessage.trim() || filePreview) &&
              isConnected
            ) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading || !isConnected}
        />

        <button
          onClick={handleSendMessage}
          className={`p-2 text-white rounded transition-colors ${
            (newMessage.trim() || filePreview) && isConnected
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={
            (!newMessage.trim() && !filePreview) || isLoading || !isConnected
          }
        >
          <FiSend size={20} />
        </button>
      </div>

      {/* Not connected warning */}
      {!isConnected && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ Reconnecting to chat server...
        </div>
      )}
    </div>
  );
};

export default MainChatWindow;
