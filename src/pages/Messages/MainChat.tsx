import { useChatSocket } from "@hooks/useChatSocket";
import MainChatWindow from "@pages/Messages/ChatWindow";
import { RootState } from "@store/index";
import {
  Chat,
  SingleChat,
  SingleMessage,
  useDeleteSingleChatRoomMutation,
  useGetAllChatMessagesQuery,
  useGetSingleChatMessagesQuery,
} from "@store/slices/chatSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainChatRoom from "./ChatRoom";
import { useChatListWebSocket } from "@hooks/useChatListWebSocket";

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

const MainChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [selectedChatId, setSelectedChatId] = useState<number | null>(
    chatId ? parseInt(chatId) : null
  );
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  // Fetch all chats
  const { data, isLoading, error, refetch } = useGetAllChatMessagesQuery(
    { token: token || "" },
    { skip: !token }
  );

  // Fetch single chat room details
  const {
    data: single_room,
    isLoading: load_room,
    error: singleRoomError,
  } = useGetSingleChatMessagesQuery(
    { chatId: selectedChatId?.toString() || "", token: token || "" },
    { skip: selectedChatId === null || !token }
  );

  const [deleteChat] = useDeleteSingleChatRoomMutation();

  const chats: Chat[] = (data?.results as Chat[]) || [];
  const [realTimeMessages, setRealTimeMessages] = useState<MessageData[]>([]);

  // Chat List WebSocket (always connected)
  const handleChatListUpdate = useCallback(() => {
    ("🔄 Chat list update received, refetching...");
    refetch();
  }, [refetch]);

  useChatListWebSocket({
    token: token || null,
    onUpdate: handleChatListUpdate,
    enabled: !!token,
  });
  const handleNewMessage = useCallback(
    (data: MessageData) => {
      if (!data.room_id) {
        return;
      }
      setRealTimeMessages((prev: any) => {
        const chatId = data.room_id;
        if (!chatId) return prev; // Prevents undefined key

        const prevMessages = prev[chatId] || [];
        const exists = prevMessages.some(
          (msg: MessageData) => msg.id === data.id
        );
        if (exists) return prev;

        return {
          ...prev,
          [chatId]: [...prevMessages, data],
        };
      });

      // Refetch chat list to update last_message and unread_count
      refetch();
    },
    [refetch]
  );

  const handleSocketError = useCallback((error: string) => {
    // Only show toast for critical errors, not during reconnection attempts
    if (error.includes("Failed to connect after multiple attempts")) {
      toast.error(error, { toastId: "websocket-error" });
    }
  }, []);

  // WebSocket connection
  const {
    sendMessage: sendSocketMessage,
    isConnected,
    disconnect,
  } = useChatSocket({
    chatId: selectedChatId,
    token: token || null,
    onMessage: handleNewMessage,
    onError: handleSocketError,
  });

  // Handle chat selection
  const handleSelectChat = useCallback(
    (chatId: number) => {
      // Clear real-time messages when switching chats
      setRealTimeMessages([]);
      setSelectedChatId(chatId);
      navigate(`/chat/${chatId}`);
      setTimeout(() => {
        refetch();
      }, 500); // Small delay to let Django mark messages as read
    },
    [navigate, refetch]
  );

  // Handle chat deletion
  const handleDelete = async (chatId: number) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to delete this chat?"
    );

    if (!confirm) return;

    try {
      await deleteChat({
        chatId: chatId.toString(),
        token: token,
      }).unwrap();

      toast.success("Chat deleted successfully");
      refetch();

      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        navigate("/chat");
      }
    } catch (error: any) {
      "Delete error:", error;
      toast.error(
        error?.data?.error || "Error occurred while deleting the chat"
      );
    }
  };

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChatId) {
        toast.error("No chat selected.");
        return;
      }

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      if (!isConnected) {
        toast.error("Not connected to chat. Reconnecting...");
        return;
      }

      try {
        const success = sendSocketMessage(content);
        if (!success) {
          toast.error("Failed to send message. Please try again.");
        }
      } catch (err: any) {
        toast.error(
          `Error occurred while sending the message: ${err.message || err}`
        );
      }
    },
    [selectedChatId, token, isConnected, sendSocketMessage]
  );

  // Update selectedChatId when URL changes
  useEffect(() => {
    if (chatId) {
      const parsedChatId = parseInt(chatId);
      if (parsedChatId !== selectedChatId) {
        setSelectedChatId(parsedChatId);
        setRealTimeMessages([]); // Clear messages when chat changes
      }
    } else {
      setSelectedChatId(null);
      setRealTimeMessages([]);
    }
  }, [chatId, selectedChatId]);

  // Cleanup WebSocket on unmount or when chat changes
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const combinedMessages = useMemo(() => {
    const apiMessages = (single_room as any)?.messages || [];
    const socketMessages = realTimeMessages[selectedChatId || 0] || [];

    const allMessages = [...apiMessages, ...socketMessages];

    const uniqueMessagesMap = new Map<number, MessageData>();
    allMessages.forEach((msg) => {
      if (!uniqueMessagesMap.has(msg.id)) {
        uniqueMessagesMap.set(msg.id, msg);
      }
    });

    return Array.from(uniqueMessagesMap.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [single_room, realTimeMessages, selectedChatId]);

  // Create properly typed SingleChat object
  const chatData: SingleChat | null = useMemo(() => {
    if (!selectedChatId || !single_room) return null;

    return {
      success: (single_room as any)?.success ?? true,
      chat: (single_room as any)?.chat ?? {
        id: selectedChatId,
        name: `Chat ${selectedChatId}`,
        participants: [],
        last_message: null,
        unread_count: 0,
      },
      messages: combinedMessages as SingleMessage[],
      participants: (single_room as any)?.participants || [],
    };
  }, [selectedChatId, single_room, combinedMessages]);

  return (
    <div className="flex flex-row h-screen">
      {/* Chat List Sidebar */}
      <div className="w-[30%] border-r border-gray-300 overflow-y-auto bg-white">
        <MainChatRoom
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDelete}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Chat Window */}
      <div className="w-[70%] overflow-y-auto bg-gray-50">
        {selectedChatId && chatData ? (
          <MainChatWindow
            chatId={selectedChatId}
            messages={chatData}
            isLoading={load_room}
            error={singleRoomError}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg
              className="w-24 h-24 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-xl font-medium">
              Select a chat to start messaging
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Choose a conversation from the list to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainChat;
