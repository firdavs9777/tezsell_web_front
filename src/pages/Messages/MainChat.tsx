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
import { FiArrowLeft } from "react-icons/fi";

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
  const [showSidebar, setShowSidebar] = useState(true);

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

  const [realTimeMessages, setRealTimeMessages] = useState<
    Record<number, MessageData[]>
  >({});

  // Sort chats by last message timestamp
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const timeA = a.last_message?.timestamp
        ? new Date(a.last_message.timestamp).getTime()
        : 0;
      const timeB = b.last_message?.timestamp
        ? new Date(b.last_message.timestamp).getTime()
        : 0;
      return timeB - timeA;
    });
  }, [chats]);

  // Chat List WebSocket
  const handleChatListUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useChatListWebSocket({
    token: token || null,
    onUpdate: handleChatListUpdate,
    enabled: !!token,
  });

  const handleNewMessage = useCallback(
    (data: MessageData) => {
      if (!data.room_id) return;

      setRealTimeMessages((prev: any) => {
        const chatId = data.room_id;
        if (!chatId) return prev;

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

      refetch();
    },
    [refetch]
  );

  const handleSocketError = useCallback((error: string) => {
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
      setRealTimeMessages([]);
      setSelectedChatId(chatId);
      navigate(`/chat/${chatId}`);
      setShowSidebar(false); // Hide sidebar on mobile when chat selected
      setTimeout(() => {
        refetch();
      }, 500);
    },
    [navigate, refetch]
  );

  // Handle back to chat list (mobile)
  const handleBackToList = useCallback(() => {
    setShowSidebar(true);
    setSelectedChatId(null);
    navigate("/chat");
  }, [navigate]);

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
        setShowSidebar(true);
      }
    } catch (error: any) {
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
        setRealTimeMessages([]);
        setShowSidebar(false);
      }
    } else {
      setSelectedChatId(null);
      setRealTimeMessages([]);
      setShowSidebar(true);
    }
  }, [chatId, selectedChatId]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const combinedMessages = useMemo(() => {
    const apiMessages = (single_room as any)?.messages || [];
    const socketMessages = realTimeMessages[selectedChatId ?? 0] || [];

    const allMessages = [...apiMessages, ...socketMessages];

    const uniqueMessagesMap = new Map<string, MessageData>();
    allMessages.forEach((msg) => {
      // Create unique key: prefer ID, fallback to content+timestamp
      const key = msg.id ? `id-${msg.id}` : `${msg.content}-${msg.timestamp}`;

      if (!uniqueMessagesMap.has(key)) {
        uniqueMessagesMap.set(key, msg);
      }
    });

    return Array.from(uniqueMessagesMap.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [single_room, realTimeMessages, selectedChatId]);

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
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Chat List Sidebar */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden"
        } md:flex w-full md:w-96 lg:w-[400px] flex-col bg-white border-r border-gray-200 shadow-lg`}
      >
        <MainChatRoom
          chats={sortedChats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDelete}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          !showSidebar || selectedChatId ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-gray-50 relative`}
      >
        {selectedChatId && chatData ? (
          <>
            {/* Mobile Back Button */}
            <div className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
              <button
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {chatData.chat.name?.[0]?.toUpperCase() || "C"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {chatData.chat.name || `Chat ${selectedChatId}`}
                  </h3>
                  <span
                    className={`text-xs ${
                      isConnected ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {isConnected ? "● Online" : "○ Offline"}
                  </span>
                </div>
              </div>
            </div>

            <MainChatWindow
              chatId={selectedChatId}
              messages={chatData}
              isLoading={load_room}
              error={singleRoomError}
              onSendMessage={handleSendMessage}
              isConnected={isConnected}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <svg
                className="w-32 h-32 text-gray-300 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Messages
            </h2>
            <p className="text-center text-gray-500 max-w-sm">
              Select a conversation from the list to start messaging and connect
              with others
            </p>
            <div className="mt-8 hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>{isConnected ? "Connected" : "Connecting..."}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainChat;
