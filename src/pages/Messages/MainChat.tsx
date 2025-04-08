import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainChatRoom from "./ChatRoom";
import MainChatWindow from "./ChatWindow";
import {
  Chat,
  useGetAllChatMessagesQuery,
  useGetSingleChatMessagesQuery,
} from "../../store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const MainChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams(); // Get chatId from URL if present
  const [selectedChatId, setSelectedChatId] = useState<number | null>(
    chatId ? parseInt(chatId) : null
  );
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const { data, isLoading, error } = useGetAllChatMessagesQuery({ token });

  const {
    data: single_room,
    isLoading: load_room,
    error: singleRoomError,
  } = useGetSingleChatMessagesQuery(
    { chatId: selectedChatId?.toString(), token },
    { skip: selectedChatId === null }
  );

  const chats: Chat[] = (data?.results as Chat[]) || [];
  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  // Handle chat selection with URL navigation
  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`); // Update URL when chat is selected
  };

  // Update selected chat if URL changes
  useEffect(() => {
    if (chatId) {
      setSelectedChatId(parseInt(chatId));
    }
  }, [chatId]);

  return (
    <div className="flex flex-row h-screen">
      <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
        <MainChatRoom
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Chat Messages */}
      <div className="w-2/3 overflow-y-auto">
        {selectedChatId && (
          <MainChatWindow
            chat={selectedChat}
            messages={single_room}
            isLoading={load_room}
            error={singleRoomError}
          />
        )}
      </div>
    </div>
  );
};

export default MainChat;
