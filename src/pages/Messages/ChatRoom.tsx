import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useState } from "react";
import { BiLoader, BiMessageSquareDetail } from "react-icons/bi";
import { FiTrash } from "react-icons/fi";

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
    <>
      <p className="text-gray-500">No chats found</p>
      <p className="text-sm text-gray-400 mt-1">
        Try a different search term
      </p>
    </>
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <BiLoader className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 font-semibold">
        Error loading chats. Please try again.
      </div>
    );
  }

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-3">Messages</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
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
                className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                  chat.id === selectedChatId
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div
                      className={`flex-shrink-0 mr-3 flex items-center justify-center h-10 w-10 rounded-full ${
                        chat.id === selectedChatId
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <BiMessageSquareDetail className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center">
                        <p
                          className={`text-sm font-medium truncate ${
                            chat.id === selectedChatId
                              ? "text-blue-800"
                              : "text-gray-800"
                          }`}
                        >
                          {chat.name}
                        </p>
                        {chat.unread_count > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                      {chat.last_message && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          <span className="font-medium">
                            {chat.last_message.sender.username}:
                          </span>{" "}
                          {chat.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    aria-label="Delete chat"
                    disabled={deletingChatId === chat.id}
                  >
                    {deletingChatId === chat.id ? (
                      <BiLoader className="animate-spin text-base" />
                    ) : (
                      <FiTrash className="text-base" />
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