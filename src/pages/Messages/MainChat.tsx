import React, { useState } from "react";
import MainChatRoom from "./ChatRoom";
import MainChatWindow from "./ChatWindow";
import "./MainChat.css";
import {
  Chat,
  ChatResponse,
  useGetAllChatMessagesQuery,
} from "../../store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const MainChat = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const { data, isLoading, error } = useGetAllChatMessagesQuery({ token });
  const chats: Chat[] = (data?.results as Chat[]) || [];

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="main-container">
      <MainChatRoom
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default MainChat;
