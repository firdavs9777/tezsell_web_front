import React, { useState, useRef, useEffect, useCallback } from "react";
import { SingleChat } from "@store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { FiPaperclip, FiSend, FiSmile } from "react-icons/fi";

interface MainChatWindowProps {
  messages: SingleChat;
  isLoading: boolean;
  chatId: number;
  error?: FetchBaseQueryError | SerializedError | undefined;
  onSendMessage: (content: string) => void;
}

interface WebSocketMessage {
  id?: number;
  content: string;
  sender: { id?: number; username: string };
  timestamp: string;
  room_id?: number;
  type?: string;
  file?: {
    url: string;
    type: "image" | "audio" | "video" | "file";
  };
}

const MainChatWindow: React.FC<MainChatWindowProps> = ({
  messages,
  isLoading,
  error,
  chatId,
  onSendMessage,
}) => {
  const userId = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info.id
  );
  const currentUsername = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info.username
  );
  const token = useSelector((state: RootState) => state.auth?.userInfo?.token);

  const [newMessage, setNewMessage] = useState("");
  const [socketMessages, setSocketMessages] = useState<WebSocketMessage[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    url: string;
    type: "image" | "audio" | "video" | "file";
    file: File;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const reconnectAttempt = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!chatId || !token) {
      console.warn("Missing chatId or token, WebSocket not connecting");
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    console.log("🔄 Connecting to WebSocket...", { chatId });

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(
      `wss://api.tezsell.com/ws/chat/${chatId}/?token=${token}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected successfully");
      setIsSocketConnected(true);
      reconnectAttempt.current = 0;
    };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("📨 Received WebSocket message:", data);

        if (data.type === "message") {
          const isMyMessage = data.sender === currentUsername;

          const messageData: WebSocketMessage = {
            content: data.message,
            sender: isMyMessage
              ? {
                  id: userId,
                  username: data.sender,
                }
              : {
                  username: data.sender,
                },
            timestamp: data.timestamp,
            id: Date.now() + Math.random(),
          };

          if (data.file) {
            messageData.file = data.file;
          }

          console.log("Processing message:", { isMyMessage, messageData });
          setSocketMessages((prev) => [...prev, messageData]);
        } else if (data.type === "connection_established") {
          console.log("✅ Connection established:", data.message);
        } else if (data.type === "error") {
          console.error("❌ Server error:", data.error);
        }
      } catch (err) {
        console.error(
          "❌ Failed to parse WebSocket message",
          err,
          "Raw data:",
          e.data
        );
      }
    };

    socket.onerror = (e) => {
      console.error("❌ WebSocket error", e);
      setIsSocketConnected(false);
    };

    socket.onclose = (event) => {
      console.log("🛑 WebSocket disconnected", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setIsSocketConnected(false);

      if (
        event.code !== 1000 &&
        reconnectAttempt.current < maxReconnectAttempts
      ) {
        const delay = Math.min(
          3000,
          1000 * Math.pow(2, reconnectAttempt.current)
        );
        reconnectAttempt.current += 1;
        console.log(
          `⏳ Reconnecting attempt ${reconnectAttempt.current} in ${delay}ms...`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      }
    };
  }, [chatId, token, currentUsername, userId]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        console.log("🔌 Closing WebSocket connection");
        socketRef.current.close(1000, "Component unmounting");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, socketMessages]);

  const sendWebSocketMessage = useCallback((content: string, file?: File) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open");
      return false;
    }

    try {
      const message: any = {
        message: content.trim(),
      };

      if (file) {
        // In a real app, you would upload the file first and then send the URL
        // For now, we'll just simulate it
        message.file = {
          url: URL.createObjectURL(file),
          type: file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("audio/")
            ? "audio"
            : file.type.startsWith("video/")
            ? "video"
            : "file",
        };
      }

      console.log("📤 Sending WebSocket message:", message);
      socketRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
      return false;
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && !filePreview) {
      console.warn("❌ Cannot send empty message");
      return;
    }

    console.log("🚀 Attempting to send message:", content);

    try {
      // Send via WebSocket first (real-time)
      const socketSent = sendWebSocketMessage(content, filePreview?.file);
      if (socketSent) {
        console.log("✅ Message sent via WebSocket");
      } else {
        console.warn("⚠️ WebSocket not available, sending via API only");
      }

      // Also send via API for persistence
      await onSendMessage(content);
      console.log("✅ Message sent via API for persistence");
    } catch (error) {
      console.error("❌ Failed to send message via API:", error);
    }

    setNewMessage("");
    setFilePreview(null);
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

  // Remove duplicates and sort messages
  const allMessages = [...(messages?.messages || []), ...socketMessages]
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .filter((msg, index, arr) => {
      const isDuplicate =
        arr.findIndex(
          (m) =>
            m.content === msg.content &&
            Math.abs(
              new Date(m.timestamp).getTime() -
                new Date(msg.timestamp).getTime()
            ) < 5000
        ) < index;
      return !isDuplicate;
    });

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300">
      {/* Connection Status Indicator */}
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isSocketConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-xs text-gray-600">
          {isSocketConnected ? "Connected" : "Disconnected"}
          {reconnectAttempt.current > 0 &&
            ` (reconnecting ${reconnectAttempt.current}/${maxReconnectAttempts})`}
        </span>
      </div>

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

      <div className="mt-4 flex gap-2 border-t pt-4 relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-600 hover:text-blue-500"
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
            if (e.key === "Enter" && (newMessage.trim() || filePreview)) {
              e.preventDefault();
              handleSendMessage(newMessage);
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading}
        />

        <button
          onClick={() => handleSendMessage(newMessage)}
          className={`p-2 text-white rounded transition-colors ${
            newMessage.trim() || filePreview
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={(!newMessage.trim() && !filePreview) || isLoading}
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default MainChatWindow;
