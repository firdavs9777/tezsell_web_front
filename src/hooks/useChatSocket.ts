import { useCallback, useEffect, useRef, useState } from "react";

interface MessageData {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
  };
  timestamp: string;
  room_id: number;
}

interface ChatSocketProps {
  chatId: number | null;  // Made non-optional to be explicit about requirements
  token: string | null;   // Made non-optional
  onMessage?: (data: MessageData) => void;
  onError?: (error: string) => void;
}

export function useChatSocket({
  chatId,
  token,
  onMessage = () => {},
  onError = () => {}
}: ChatSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueue = useRef<Array<string>>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
const reconnectInterval = useRef<ReturnType<typeof setTimeout>>();
  const isConnecting = useRef(false);

  const processQueue = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        if (message) {
          socketRef.current?.send(message);
        }
      }
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "connection_established") {
        console.log("WebSocket connection confirmed by server");
        return;
      }
      if (data.type === "message" && data.data) {
        onMessage(data.data);
      } else if (data.type === "error") {
        onError(data.error || "Unknown error occurred");
      }
    } catch (error) {
      onError("Failed to parse message");
      console.error("Message parsing error:", error);
    }
  }, [onMessage, onError]);

  const connect = useCallback(() => {
    // Don't connect if already connecting or missing required params
    if (isConnecting.current || !chatId || !token) {
      return;
    }
    isConnecting.current = true;
    // Clear any existing reconnection attempts
    if (reconnectInterval.current) {
      clearTimeout(reconnectInterval.current);
      reconnectInterval.current = undefined;
    }

    const socketUrl = `wss://api.webtezsell.com/ws/chat/${chatId}/$`;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      isConnecting.current = false;

      // Send authentication token immediately
      socket.send(JSON.stringify({
        type: "authenticate",
        token: token
      }));
      // Process any queued messages
      processQueue();
    };

    socket.onmessage = handleMessage;

    socket.onclose = (event) => {
      setIsConnected(false);
      isConnecting.current = false;
      console.log(`❌ WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);

      // Only attempt reconnect for unexpected closures
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;
        console.log(`Reconnecting attempt ${reconnectAttempts.current} in ${delay}ms...`);
        reconnectInterval.current = setTimeout(connect, delay);
      }
    };

    socket.onerror = (error) => {
      isConnecting.current = false;
      console.error("WebSocket error:", error);
      onError("Connection error occurred");
    };
  }, [chatId, token, processQueue, handleMessage, onError]);

  const sendMessage = useCallback((messageContent: string) => {
    if (!messageContent.trim()) {
      onError("Message cannot be empty");
      return false;
    }

    const message = JSON.stringify({
      type: "chat_message",
      message: messageContent.trim()
    });

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(message);
        return true;
      } catch (error) {
        onError("Failed to send message");
        console.error("Message send error:", error);
        return false;
      }
    } else {
      messageQueue.current.push(message);
      console.warn("Message queued - connection not ready");

      // If not connected and not already trying to connect, attempt connection
      if (!isConnected && !isConnecting.current) {
        connect();
      }

      return false;
    }
  }, [onError, isConnected, connect]);

  // Handle connection when chatId or token changes
  useEffect(() => {
    if (chatId && token) {
      connect();
    } else {
      // Clean up if chatId or token becomes invalid
      if (socketRef.current) {
        socketRef.current.close(1000, "Chat ID or token changed");
      }
      setIsConnected(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
      if (reconnectInterval.current) {
        clearTimeout(reconnectInterval.current);
      }
    };
  }, [chatId, token, connect]);

  return {
    sendMessage,
    isConnected,
    disconnect: () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "User initiated disconnect");
      }
    }
  };
}
