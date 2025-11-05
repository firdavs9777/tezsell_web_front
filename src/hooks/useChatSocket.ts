import { useCallback, useEffect, useRef, useState } from "react";

interface MessageData {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
  };
  timestamp: string;
  room_id?: number;
}

interface ChatSocketProps {
  chatId: number | null;
  token: string | null;
  onMessage?: (data: MessageData) => void;
  onError?: (error: string) => void;
}

export function useChatSocket({
  chatId,
  token,
  onMessage = () => {},
  onError = () => {},
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

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connection_established") {
          setIsConnected(true);
          processQueue(); // Process queued messages after connection is confirmed
          return;
        }
        const generateId = () => {
          if (data.id) return data.id;

          // Create hash from content + timestamp + sender
          const str = `${data.message}-${data.timestamp}-${
            data.sender?.id || ""
          }`;
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          return Math.abs(hash);
        };

        // Handle regular chat messages
        if (data.type === "message") {
          const messageData: MessageData = {
            id: generateId(),
            content: data.message,
            sender: data.sender,
            timestamp: data.timestamp,
            room_id: chatId || undefined,
          };

          onMessage(messageData);
        } else if (data.type === "error") {
          onError(data.error || "Unknown error occurred");
        }
      } catch (error) {
        onError("Failed to parse message");
      }
    },
    [onMessage, onError, chatId, processQueue]
  );

  const connect = useCallback(() => {
    if (isConnecting.current || !chatId || !token) {
      return;
    }

    isConnecting.current = true;

    // Clear any existing reconnection attempts
    if (reconnectInterval.current) {
      clearTimeout(reconnectInterval.current);
      reconnectInterval.current = undefined;
    }

    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    let socketUrl: string;
    // const isDevelopment = import.meta.env.DEV; // For Vite
    // if (isDevelopment) {
    //   // Development: Connect to Django backend on localhost:8000
    //   const wsBaseUrl = "wss://api.webtezsell.com";
    //   // const wsBaseUrl = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";
    //   // const wsBaseUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000'; // For CRA
    //   socketUrl = `${wsBaseUrl}/ws/chat/${chatId}/?token=${token}`;
    // } else {
    //   // Production: Use same host as the web page
    //   const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    //   const host = window.location.host;
    //   socketUrl = `${protocol}//${host}/ws/chat/${chatId}/?token=${token}`;
    // }

    try {
      const wsBaseUrl = "wss://api.webtezsell.com";
      // const wsBaseUrl = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";
      // const wsBaseUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000'; // For CRA
      socketUrl = `${wsBaseUrl}/ws/chat/${chatId}/?token=${token}`;
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempts.current = 0;
        isConnecting.current = false;
      };

      socket.onmessage = handleMessage;

      socket.onclose = (event) => {
        setIsConnected(false);
        isConnecting.current = false;
        socketRef.current = null;
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectAttempts.current += 1;
          reconnectInterval.current = setTimeout(connect, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          onError(
            "Failed to connect after multiple attempts. Please refresh the page."
          );
        }
      };

      socket.onerror = (error) => {
        isConnecting.current = false;
        console.error(error);

        onError("Connection error occurred. Check console for details.");
      };
    } catch (error: any) {
      isConnecting.current = false;
      onError("Failed to create connection");
    }
  }, [chatId, token, handleMessage, onError]);

  const sendMessage = useCallback(
    (messageContent: string) => {
      if (!messageContent.trim()) {
        onError("Message cannot be empty");
        return false;
      }

      const message = JSON.stringify({
        message: messageContent.trim(),
      });

      if (socketRef.current?.readyState === WebSocket.OPEN && isConnected) {
        try {
          socketRef.current.send(message);

          return true;
        } catch (error) {
          onError("Failed to send message");
          return false;
        }
      } else {
        messageQueue.current.push(message);

        if (!isConnected && !isConnecting.current) {
          connect();
        }
        return false;
      }
    },
    [onError, isConnected, connect]
  );

  const disconnect = useCallback(() => {
    ("🔌 Disconnecting WebSocket...");

    if (reconnectInterval.current) {
      clearTimeout(reconnectInterval.current);
      reconnectInterval.current = undefined;
    }
    if (socketRef.current) {
      socketRef.current.close(1000, "User initiated disconnect");
      socketRef.current = null;
    }
    setIsConnected(false);
    reconnectAttempts.current = 0;
    isConnecting.current = false;
    messageQueue.current = [];
  }, []);

  useEffect(() => {
    if (chatId && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [chatId, token, connect, disconnect]);

  return {
    sendMessage,
    isConnected,
    disconnect,
  };
}
