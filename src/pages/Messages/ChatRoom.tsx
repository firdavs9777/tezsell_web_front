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
  unread_count: number;
}

interface MainChatRoomProps {
  chats: Chat[];
  selectedChatId: number | null;
  onSelectChat: (id: number) => void;
  onDeleteChat: (id: number) => Promise<void> | void;
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError | undefined;
  emptyStateMessage?: React.ReactNode;
}

const MainChatRoom: React.FC<MainChatRoomProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  isLoading,
  error,
  emptyStateMessage = (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
        <BiMessageSquareDetail className="text-4xl text-blue-500" />
      </div>
      <p className="text-gray-600 font-medium">No chats found</p>
      <p className="text-sm text-gray-400 mt-1">Start a new conversation</p>
    </div>
  ),
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
    try {
      await onDeleteChat(chatId);
    } finally {
      setDeletingChatId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full w-full">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <BiMessageSquareDetail className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl" />
        </div>
        <p className="mt-4 text-sm text-gray-500">Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-red-600 font-semibold text-center">
          Error loading chats
        </p>
        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <aside className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 md:px-6 md:py-5 sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white">Messages</h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center text-xs text-blue-100 bg-white/20 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              {chats.length} chats
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/95 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-gray-400 shadow-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {emptyStateMessage}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <li
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`px-4 py-3 md:px-6 md:py-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  chat.id === selectedChatId
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Avatar & Chat Info */}
                  <div className="flex items-center min-w-0 flex-1 gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full font-semibold text-lg shadow-md transition-all ${
                          chat.id === selectedChatId
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ring-4 ring-blue-100"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                        }`}
                      >
                        {chat.name?.[0]?.toUpperCase() || (
                          <BiMessageSquareDetail />
                        )}
                      </div>
                      {chat.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          {chat.unread_count > 9 ? "9+" : chat.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <p
                          className={`text-sm md:text-base font-semibold truncate ${
                            chat.id === selectedChatId
                              ? "text-blue-800"
                              : chat.unread_count > 0
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {chat.name || `Chat ${chat.id}`}
                        </p>
                        {chat.last_message && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatTimestamp(chat.last_message.timestamp)}
                          </span>
                        )}
                      </div>

                      {chat.last_message && (
                        <p
                          className={`text-xs md:text-sm truncate ${
                            chat.unread_count > 0
                              ? "text-gray-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          <span className="font-semibold text-gray-600">
                            {chat.last_message.sender.username}:
                          </span>{" "}
                          {chat.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    aria-label="Delete chat"
                    disabled={deletingChatId === chat.id}
                  >
                    {deletingChatId === chat.id ? (
                      <BiLoader className="animate-spin text-lg" />
                    ) : (
                      <FiTrash className="text-base md:text-lg" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default MainChatRoom;
