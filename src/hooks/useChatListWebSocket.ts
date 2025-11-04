import { useCallback, useEffect, useRef, useState } from "react";

// interface ChatRoom {
//   id: number;
//   name: string;
//   last_message_preview: string | null;
//   last_message_timestamp: string | null;
//   unread_count: number;
//   participant_ids: number[];
// }

interface UseChatListWebSocketProps {
  token: string | null;
  onUpdate?: () => void; // Callback to trigger refetch
  enabled?: boolean;
}

export function useChatListWebSocket({
  token,
  onUpdate,
  enabled = true,
}: UseChatListWebSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnectingRef = useRef(false); // ⭐ ADD THIS

  const connect = useCallback(() => {
    if (!enabled || !token || isConnectingRef.current) return; // ⭐ ADD CHECK

    isConnectingRef.current = true; // ⭐ ADD THIS

    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const isDevelopment = import.meta.env.DEV;
    const wsBaseUrl = isDevelopment
      ? import.meta.env.VITE_WS_URL || "ws://localhost:8000"
      : `${protocol}//${window.location.host}`;

    const url = `${wsBaseUrl}/ws/chatlist/?token=${token}`;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      isConnectingRef.current = false; // ⭐ ADD THIS
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (
          data.type === "chatroom_list" ||
          data.type === "chatroom_list_update"
        ) {
          onUpdate?.();
        }
      } catch (error) {
        console.error(error);
      }
    };

    socket.onerror = (error: any) => {
      isConnectingRef.current = false; // ⭐ ADD THIS
    };

    socket.onclose = () => {
      setIsConnected(false);
      isConnectingRef.current = false; // ⭐ ADD THIS
    };
  }, [token, enabled, onUpdate]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
    isConnectingRef.current = false; // ⭐ ADD THIS
  }, []);

  useEffect(() => {
    if (enabled && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token, connect, disconnect]);

  return {
    isConnected,
    disconnect,
  };
}
