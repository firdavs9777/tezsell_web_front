import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React from "react";
import { BiLoader } from "react-icons/bi";

export interface Chat {
  id: number;
  name: string;
  participants: number[];
  last_message: {
    id: number;
    content: string;
    timestamp: string;
    sender: {
      id: number;
      username: string;
    };
  } | null;
}

interface MainChatRoomProps {
  chats: Chat[];
  selectedChatId: number | null;
  onSelectChat: (id: number) => void;
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError | undefined;
}

const MainChatRoom: React.FC<MainChatRoomProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  isLoading,
  error,
}) => {
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <BiLoader className="animate-spin text-3xl text-blue-500" />
      </div>
    );

  if (error) {
    return (
      <div className="p-4 text-red-500 font-semibold">
        Error occurred. Please try again.
      </div>
    );
  }

  return (
    <div className="chat-room-list p-4 max-h-screen overflow-y-auto bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Chat List</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading chats...</p>
      ) : chats.length === 0 ? (
        <p className="text-gray-400">No chats available.</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors ${
              chat.id === selectedChatId
                ? "bg-blue-100 text-blue-800"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="font-medium">{chat.name}</div>
            {chat.last_message && (
              <div className="text-sm text-gray-500 truncate">
                {chat.last_message.content}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MainChatRoom;
