import React, { useState, useRef, useEffect } from "react";
import { SingleChat } from "@store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface MainChatWindowProps {
  messages: SingleChat | undefined;
  isLoading: boolean;
  chatId: number;
  error?: FetchBaseQueryError | SerializedError | undefined;
  onSendMessage: (content: string) => void;
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

  const [newMessage, setNewMessage] = useState("");
  const [socketMessages, setSocketMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // WebSocket Connection
  useEffect(() => {
    console.log(chatId);
    if (!chatId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setSocketMessages((prev) => [...prev, data]);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (e) => {
      console.error("WebSocket error", e);
    };

    return () => {
      socket.close();
    };
  }, [chatId]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, socketMessages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    onSendMessage(content);
    setNewMessage("");
  };

  const allMessages = [...(messages?.messages || []), ...socketMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading && <p className="text-gray-400">Loading messages...</p>}
        {error && <p className="text-red-500">Error loading chat</p>}

        {allMessages.map((msg) => {
          const isMyMessage = msg.sender.id === userId;
          return (
            <div
              key={msg.id || Math.random()} // WebSocket messages may not have an ID
              className={`flex ${
                isMyMessage ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[300px] sm:max-w-md px-4 py-2 rounded-lg text-sm shadow 
                ${
                  isMyMessage
                    ? "bg-green-200 text-left"
                    : "bg-blue-100 text-right"
                }`}
              >
                <div className="mb-1">{msg.content}</div>
                <div className="text-xs text-gray-600 flex justify-between gap-2">
                  <span>{msg.sender.username}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2 border-t pt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage(newMessage);
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={() => handleSendMessage(newMessage)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MainChatWindow;
