import { useCallback, useEffect, useRef, useState } from "react";

interface MessageData {
  id: number;
  content: string;
  message_type?: "text" | "image" | "voice" | "system";
  sender: {
    id: number;
    username: string;
  };
  timestamp: string;
  updated_at?: string;
  room_id?: number;
  is_edited?: boolean;
  is_deleted?: boolean;
  reactions?: Record<string, number[]>;
  reply_to?: number | null;
  file_url?: string;
  duration?: number;
}

interface ChatSocketProps {
  chatId: number | null;
  token: string | null;
  onMessage?: (data: MessageData) => void;
  onMessageUpdated?: (data: { id: number; content: string; is_edited: boolean; updated_at: string }) => void;
  onMessageDeleted?: (data: { message_id: number }) => void;
  onMessageReaction?: (data: { message_id: number; reactions: Record<string, number[]> }) => void;
  onTyping?: (data: { user_id: number; username: string; is_typing: boolean }) => void;
  onError?: (error: string) => void;
}

export function useChatSocket({
  chatId,
  token,
  onMessage = () => {},
  onMessageUpdated = () => {},
  onMessageDeleted = () => {},
  onMessageReaction = () => {},
  onTyping = () => {},
  onError = () => {},
}: ChatSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueue = useRef<Array<string>>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = useRef<ReturnType<typeof setTimeout>>();
  const isConnecting = useRef(false);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const consecutiveFailuresRef = useRef(0);
  const lastFailureTimeRef = useRef<number>(0);
  const currentChatIdRef = useRef<number | null>(null);
  const currentTokenRef = useRef<string | null>(null);

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

        // Handle different message types
        switch (data.type) {
          case "connection_established":
            console.log("Connection fully established:", data);
            // Clear the connection timeout
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
              connectionTimeoutRef.current = undefined;
            }
            // Mark connection as established
            if (socketRef.current && (socketRef.current as any)._connectionEstablishedFlag) {
              (socketRef.current as any)._connectionEstablishedFlag.value = true;
            }
            setIsConnected(true);
            consecutiveFailuresRef.current = 0; // Reset failure counter on successful connection
            processQueue(); // Process queued messages after connection is confirmed
            break;

          case "message":
            const messageData: MessageData = {
              id: data.id,
              content: data.content || data.message,
              message_type: data.message_type || "text",
              sender: data.sender,
              timestamp: data.timestamp,
              updated_at: data.updated_at,
              room_id: chatId || undefined,
              is_edited: data.is_edited || false,
              is_deleted: data.is_deleted || false,
              reactions: data.reactions || {},
              reply_to: data.reply_to || null,
              file_url: data.file_url,
              duration: data.duration,
            };
            onMessage(messageData);
            break;

          case "message_updated":
            onMessageUpdated({
              id: data.id,
              content: data.content,
              is_edited: data.is_edited,
              updated_at: data.updated_at,
            });
            break;

          case "message_deleted":
            onMessageDeleted({
              message_id: data.message_id,
            });
            break;

          case "message_reaction":
            onMessageReaction({
              message_id: data.message_id,
              reactions: data.reactions,
            });
            break;

          case "typing":
            onTyping({
              user_id: data.user_id,
              username: data.username,
              is_typing: data.is_typing,
            });
            break;

          case "error":
            onError(data.error || "Unknown error occurred");
            break;

          default:
            console.warn("Unknown WebSocket message type:", data.type);
        }
      } catch (error) {
        onError("Failed to parse message");
      }
    },
    [onMessage, onMessageUpdated, onMessageDeleted, onMessageReaction, onTyping, onError, chatId, processQueue]
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
        console.log("WebSocket opened, waiting for connection_established message...");
        reconnectAttempts.current = 0;
        isConnecting.current = false;
        
        // Set a timeout - if we don't receive connection_established within 5 seconds,
        // the connection is likely broken
        const connectionEstablishedFlag = { value: false };
        (socket as any)._connectionEstablishedFlag = connectionEstablishedFlag;
        
        connectionTimeoutRef.current = setTimeout(() => {
          // Check if connection_established was received
          if (!connectionEstablishedFlag.value && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.warn("Connection timeout: No connection_established message received");
            socketRef.current.close(1006, "Connection timeout - no connection_established received");
          }
        }, 5000);
        
        // Don't set isConnected to true yet - wait for connection_established message
        // This ensures the backend has fully authenticated and initialized the connection
      };

      socket.onmessage = handleMessage;

      socket.onclose = (event) => {
        // Clear connection timeout if it exists
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = undefined;
        }

        const closeInfo = {
          code: event.code,
          reason: event.reason || "No reason provided",
          wasClean: event.wasClean,
          timestamp: new Date().toISOString(),
        };
        console.log("WebSocket closed:", closeInfo);
        setIsConnected(false);
        isConnecting.current = false;
        socketRef.current = null;
        
        // Don't reconnect on normal closure (1000)
        if (event.code === 1000) {
          console.log("WebSocket closed normally");
          consecutiveFailuresRef.current = 0;
          return;
        }

        // Track consecutive failures
        const now = Date.now();
        const timeSinceLastFailure = now - lastFailureTimeRef.current;
        lastFailureTimeRef.current = now;

        // If failures are happening very quickly (within 2 seconds), increment counter
        if (timeSinceLastFailure < 2000) {
          consecutiveFailuresRef.current += 1;
        } else {
          consecutiveFailuresRef.current = 1; // Reset if enough time has passed
        }

        // Code 1006 (abnormal closure) usually means:
        // - Server closed connection without sending close frame
        // - Network issue
        // - Backend WebSocket consumer error/crash
        // - Authentication failure after connection
        if (event.code === 1006) {
          console.error("WebSocket closed abnormally (1006). Possible causes:");
          console.error("- Backend WebSocket consumer error");
          console.error("- Authentication failure");
          console.error("- Network connectivity issue");
          console.error("- Backend timeout or crash");
          
          // Only show error to user if not too many consecutive failures
          if (consecutiveFailuresRef.current <= 2) {
            onError("WebSocket connection closed unexpectedly. The server may be experiencing issues.");
          }
        } else if (event.code === 1008) {
          onError("WebSocket connection closed: Policy violation. Please check authentication.");
        } else if (event.code === 1011) {
          onError("WebSocket connection closed: Server error. Please try again later.");
        } else if (event.reason) {
          onError(`WebSocket connection closed: ${event.reason}`);
        }

        // Stop reconnecting if we have too many consecutive failures
        if (consecutiveFailuresRef.current >= 10) {
          console.error("Too many consecutive failures. Stopping reconnection to avoid server overload.");
          onError(
            "WebSocket connection failed repeatedly. The server may be down. Please refresh the page."
          );
          return;
        }

        // Only reconnect if we haven't exceeded max attempts
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          // Exponential backoff with jitter to avoid thundering herd
          const baseDelay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          const jitter = Math.random() * 1000; // Add random 0-1s jitter
          const delay = baseDelay + jitter;
          
          reconnectAttempts.current += 1;
          console.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          reconnectInterval.current = setTimeout(connect, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error("Max reconnection attempts reached. Stopping reconnection.");
          onError(
            "Failed to connect after multiple attempts. The WebSocket server may be down. Please refresh the page."
          );
        }
      };

      socket.onerror = (error) => {
        isConnecting.current = false;
        console.error("WebSocket error:", error);
        console.error("Socket state:", {
          readyState: socket.readyState,
          url: socketUrl,
        });

        // Don't show error if we're already handling it in onclose
        if (socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
          onError("Connection error occurred. Check console for details.");
        }
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
        type: "message",
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

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const message = JSON.stringify({
        type: "typing",
        is_typing: isTyping,
      });

      if (socketRef.current?.readyState === WebSocket.OPEN && isConnected) {
        try {
          socketRef.current.send(message);
          return true;
        } catch (error) {
          console.error("Failed to send typing indicator");
          return false;
        }
      }
      return false;
    },
    [isConnected]
  );

  const disconnect = useCallback(() => {
    // Only log if we actually have a socket to disconnect
    if (socketRef.current) {
      console.log("🔌 Disconnecting WebSocket...");
    }

    if (reconnectInterval.current) {
      clearTimeout(reconnectInterval.current);
      reconnectInterval.current = undefined;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = undefined;
    }
    if (socketRef.current) {
      socketRef.current.close(1000, "User initiated disconnect");
      socketRef.current = null;
    }
    setIsConnected(false);
    reconnectAttempts.current = 0;
    consecutiveFailuresRef.current = 0;
    isConnecting.current = false;
    messageQueue.current = [];
    // Clear refs when disconnecting
    currentChatIdRef.current = null;
    currentTokenRef.current = null;
  }, []);

  useEffect(() => {
    // Check if chatId or token actually changed
    const chatIdChanged = currentChatIdRef.current !== chatId;
    const tokenChanged = currentTokenRef.current !== token;
    
    // Only connect/disconnect if something actually changed
    if (chatId && token) {
      if (chatIdChanged || tokenChanged || !socketRef.current) {
        // Update refs before connecting
        currentChatIdRef.current = chatId;
        currentTokenRef.current = token;
        connect();
      }
      // If nothing changed and socket exists, don't do anything
    } else {
      // Only disconnect if we had a connection
      if (socketRef.current || currentChatIdRef.current !== null || currentTokenRef.current !== null) {
        currentChatIdRef.current = null;
        currentTokenRef.current = null;
        disconnect();
      }
    }

    return () => {
      // Only disconnect on unmount if chatId/token changed or component is unmounting
      // This prevents unnecessary disconnects during React StrictMode double-mounting
      if (currentChatIdRef.current !== chatId || currentTokenRef.current !== token) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, token]); // Only depend on chatId and token, not connect/disconnect to avoid loops

  return {
    sendMessage,
    sendTyping,
    isConnected,
    disconnect,
  };
}
