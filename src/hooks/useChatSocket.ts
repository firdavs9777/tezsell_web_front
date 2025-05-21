import { useEffect, useRef } from "react";

interface Props {
  chatId: number | null;
  token?: string;
  onMessage: (data: any) => void;
}

export function useChatSocket({ chatId, token, onMessage }: Props) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!chatId || !token) return;

    const socketUrl = `wss://api.tezsell.com/ws/chat/${chatId}/?token=${token}`;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    return () => {
      socket.close();
    };
  }, [chatId, token]);

  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message }));
    } else {
      console.warn("Socket not open. Message not sent.");
    }
  };

  return { sendMessage };
}
