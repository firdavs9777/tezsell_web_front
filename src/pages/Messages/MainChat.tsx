import { useChatSocket } from "@hooks/useChatSocket";
import MainChatWindow from "@pages/Messages/ChatWindow";
import { RootState } from "@store/index";
import {
  Chat,
  SingleChat,
  useDeleteSingleChatRoomMutation,
  useGetAllChatMessagesQuery,
  useGetSingleChatMessagesQuery,
} from "@store/slices/chatSlice";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainChatRoom from "./ChatRoom";

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

const MainChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(
    chatId ? parseInt(chatId) : null
  );
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const { data, isLoading, error, refetch } = useGetAllChatMessagesQuery({
    token,
  });

  const {
    data: single_room,
    isLoading: load_room,
    error: singleRoomError,
    refetch: reload_chat,
  } = useGetSingleChatMessagesQuery(
    { chatId: selectedChatId?.toString() || "", token },
    { skip: selectedChatId === null }
  );

  const [deleteChat] = useDeleteSingleChatRoomMutation();
  const chats: Chat[] = (data?.results as Chat[]) || [];

  const [realTimeMessages, setRealTimeMessages] = useState<MessageData[]>([]);

  const handleNewMessage = useCallback((data: MessageData) => {
    setRealTimeMessages((prev) => [...prev, data]);
  }, []);

  const { sendMessage: sendSocketMessage } = useChatSocket({
    chatId: selectedChatId,
    token: token || null,
    onMessage: handleNewMessage,
  });

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setRealTimeMessages([]);
    navigate(`/chat/${chatId}`);
    reload_chat();
    refetch();
  };

  const handleDelete = async (chatId: number) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this chat?"
    );
    if (!confirm) return;

    try {
      await deleteChat({
        chatId: chatId.toString(),
        token,
      });
      toast.success("Chat deleted successfully");
      refetch();
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        navigate("/chat");
      }
    } catch (err) {
      toast.error("Error occurred while deleting the chat");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) {
      toast.error("No chat selected.");
      return;
    }
    try {
      sendSocketMessage(content);
      refetch();
    } catch (err: unknown) {
      toast.error(`Error occurred while sending the message: ${err}`);
    }
  };

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(parseInt(chatId));
      refetch();
    } else {
      setSelectedChatId(null);
    }
  }, [chatId, refetch]);

  // Safely extract messages from the API response
  const apiMessages =
    (single_room as any)?.messages || (single_room as any)?.results || [];

  // Combine messages from API and WebSocket
  const combinedMessages = [...apiMessages, ...realTimeMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Filter out duplicates (in case API and WebSocket send the same message)
  const uniqueMessages = combinedMessages.reduce(
    (acc: MessageData[], current) => {
      const x = acc.find((item) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    },
    []
  );

  // Create a properly typed SingleChat object for the ChatWindow
  const createChatData = (): SingleChat => {
    return {
      success: (single_room as any)?.success ?? true,
      chat: (single_room as any)?.chat ?? {
        id: selectedChatId || 0,
        participants: (single_room as any)?.participants || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      messages: uniqueMessages,
      participants: (single_room as any)?.participants || [],
    };
  };

  return (
    <div className="flex flex-row h-screen">
      <div className="w-[30%] border-r border-gray-300 overflow-y-auto">
        <MainChatRoom
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDelete}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div className="w-[70%] overflow-y-auto">
        {selectedChatId ? (
          <MainChatWindow
            chatId={selectedChatId}
            messages={createChatData()}
            isLoading={load_room}
            error={singleRoomError}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default MainChat;
