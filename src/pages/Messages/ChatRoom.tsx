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
      <div className="flex justify-center items-center h-full w-full">
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
<aside className="w-full sm:w-80 md:w-96 h-screen bg-white border border-gray-200 shadow-md overflow-y-auto p-4 m-4">

      <div className="p-4 sticky top-0 bg-white z-10 border-b-2 text-start">
        <h1 className="text-xl font-bold">Chat List</h1>
      </div>

      <div className="px-4 py-2 space-y-2">
        {chats.length === 0 ? (
          <p className="text-gray-400">No chats available.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                chat.id === selectedChatId
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="font-medium">{chat.name}</div>
              {chat.last_message && (
                <div className="text-sm text-gray-600 truncate">
                  {chat.last_message.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default MainChatRoom;
