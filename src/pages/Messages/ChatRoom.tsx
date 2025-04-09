import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useState } from "react";
import { BiLoader, BiMessageSquareDetail } from "react-icons/bi";
import { FiTrash, FiSearch } from "react-icons/fi";

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
  onDeleteChat: (id: number) => void;
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError | undefined;
}

const MainChatRoom: React.FC<MainChatRoomProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  isLoading,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const t = (text: string) => {
    if (text === "search_product_placeholder") return "Search chat...";
    return text;
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering chat selection
    await onDeleteChat(chatId);
  };

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
    <aside className="w-full md:w-64 lg:w-80 xl:w-96 h-full md:h-screen bg-white border border-gray-200 shadow-md overflow-hidden flex flex-col">
      <div className="p-3 md:p-4 sticky top-0 bg-white z-10 border-b border-gray-200">
        <h1 className="text-lg md:text-xl font-bold text-gray-800">
          Chat List
        </h1>
        <div className="relative mt-2 md:mt-3">
          <input
            type="text"
            placeholder={t("search_product_placeholder")}
            className="w-full pl-9 pr-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pb-4">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-32 p-4">
            <p className="text-gray-500">No chats found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="space-y-1 md:space-y-2 p-2 md:p-3">
            {filteredChats
              .slice()
              .reverse()
              .map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex items-center rounded-lg cursor-pointer transition-all duration-200 group ${
                    chat.id === selectedChatId
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center p-2 md:p-3 w-full">
                    <div className="flex-shrink-0 mr-2 md:mr-3 hidden sm:block">
                      <BiMessageSquareDetail
                        className={`text-lg md:text-xl ${
                          chat.id === selectedChatId
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm md:text-base truncate ${
                          chat.id === selectedChatId
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {chat.name}
                      </div>
                      {chat.last_message && (
                        <div className="text-xs md:text-sm text-gray-500 truncate mt-0.5 md:mt-1 max-w-full">
                          {chat.last_message.content}
                        </div>
                      )}
                    </div>
                    <button
                      className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      aria-label="Delete chat"
                    >
                      <FiTrash className="text-base md:text-lg" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default MainChatRoom;
