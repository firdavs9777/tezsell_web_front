import React, { useState, useRef, useEffect, useCallback } from "react";
import { SingleChat } from "@store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

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
  sender: number | { id: number; username: string };
  timestamp: string;
  room_id?: number;
  type?: string;
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!chatId || !token) {
      console.warn("Missing chatId or token, WebSocket not connecting");
      return;
    }

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    console.log("🔄 Connecting to WebSocket...", { chatId });

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create new WebSocket connection with token in query params
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${chatId}/?token=${token}`
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

        // Handle different message types from your Django consumer
        if (data.type === "message") {
          // Check if this message is from the current user
          const isMyMessage = data.sender === currentUsername;
          
          const messageData = {
            content: data.message,
            sender: isMyMessage ? {
              id: userId,
              username: data.sender
            } : {
              username: data.sender
            },
            timestamp: data.timestamp,
            id: Date.now() + Math.random() // Generate unique temporary ID
          };
          
          console.log("Processing message:", { isMyMessage, messageData });
          setSocketMessages((prev) => [...prev, messageData]);
        } else if (data.type === "connection_established") {
          console.log("✅ Connection established:", data.message);
        } else if (data.type === "error") {
          console.error("❌ Server error:", data.error);
        }
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message", err, "Raw data:", e.data);
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
        wasClean: event.wasClean
      });
      setIsSocketConnected(false);

      // Attempt reconnection if not a normal closure and we haven't exceeded max attempts
      if (event.code !== 1000 && reconnectAttempt.current < maxReconnectAttempts) {
        const delay = Math.min(3000, 1000 * Math.pow(2, reconnectAttempt.current));
        reconnectAttempt.current += 1;
        console.log(`⏳ Reconnecting attempt ${reconnectAttempt.current} in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      }
    };
  }, [chatId, token, currentUsername, userId]);

  // Initialize WebSocket connection
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

  // Scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, socketMessages]);

  const sendWebSocketMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open");
      return false;
    }

    try {
      // This is the correct format that your Django consumer expects
      const message = {
        message: content.trim()  // Django consumer expects { "message": "content" }
      };
      
      console.log("📤 Sending WebSocket message:", message);
      socketRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
      return false;
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      console.warn("❌ Cannot send empty message");
      return;
    }

    console.log("🚀 Attempting to send message:", content);

    try {
      // Send via WebSocket first (real-time)
      const socketSent = sendWebSocketMessage(content);
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
  };

  // Remove duplicates and sort messages
  const allMessages = [...(messages?.messages || []), ...socketMessages]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .filter((msg, index, arr) => {
      // Remove duplicates based on content and timestamp (for messages that come from both API and WebSocket)
      const isDuplicate = arr.findIndex(m => 
        m.content === msg.content && 
        Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 5000
      ) < index;
      return !isDuplicate;
    });

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300">
      {/* Connection Status Indicator */}
      <div className="mb-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isSocketConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="text-xs text-gray-600">
          {isSocketConnected ? 'Connected' : 'Disconnected'}
          {reconnectAttempt.current > 0 && ` (reconnecting ${reconnectAttempt.current}/${maxReconnectAttempts})`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading && <p className="text-gray-400">Loading messages...</p>}
        {error && <p className="text-red-500">Error loading chat</p>}

        {allMessages.map((msg, index) => {
          console.log("Rendering message:", msg);
          
          // Better sender identification logic
          let isMyMessage = false;
          
          if (typeof msg.sender === 'object' && msg.sender?.id) {
            // If sender is an object with id, compare the id
            isMyMessage = msg.sender.id === userId;
          } else if (typeof msg.sender === 'number') {
            // If sender is just a number (user id), compare directly
            isMyMessage = msg.sender === userId;
          } else if (typeof msg.sender === 'object' && msg.sender?.username) {
            // If we only have username, check if it matches current user's username
            isMyMessage = msg.sender.username === currentUsername;
          }
          
          console.log("Message alignment:", { isMyMessage, userId, currentUsername, msgSender: msg.sender });
          
          return (
            <div
              key={msg.id || `msg-${index}`}
              className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[300px] sm:max-w-md px-4 py-2 rounded-lg text-sm shadow ${
                  isMyMessage ? "bg-blue-100 text-right" : "bg-green-200 text-left"
                }`}
              >
                <div className="mb-1">{msg.content}</div>
                <div className="text-xs text-gray-600 flex justify-between gap-2">
                  <span>
                    {isMyMessage ? 'You' : (
                      typeof msg.sender === 'object' 
                        ? msg.sender.username 
                        : 'Other user'
                    )}
                  </span>
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
            if (e.key === "Enter" && newMessage.trim()) {
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
          className={`px-4 py-2 text-white rounded transition-colors ${
            newMessage.trim()
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!newMessage.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MainChatWindow;