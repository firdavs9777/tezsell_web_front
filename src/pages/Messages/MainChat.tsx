import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainChatRoom from "./ChatRoom";
import MainChatWindow from "./ChatWindow";
import {
  Chat,
  useCreateChatRoomMessageMutation,
  useDeleteSingleChatRoomMutation,
  useGetAllChatMessagesQuery,
  useGetSingleChatMessagesQuery,
} from "../../store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { toast } from "react-toastify";

const MainChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams(); // Get chatId from URL if present
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
    { chatId: selectedChatId?.toString(), token },
    { skip: selectedChatId === null }
  );

  const [deleteChat] = useDeleteSingleChatRoomMutation();
  const [sendMessage] = useCreateChatRoomMessageMutation();
  const chats: Chat[] = (data?.results as Chat[]) || [];
  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  // Handle chat selection with URL navigation
  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`); // Update URL when chat is selected
  };

  const handleDelete = (chatId: number) => {
    const ConfirmToast = () => (
      <div className="h-[70px] m-2">
        <p className="mb-2">Are you sure you want to delete this chat?</p>
        <div className="flex justify-center gap-2">
          <button
            onClick={async () => {
              try {
                await deleteChat({
                  chatId: chatId.toString(),
                  token,
                });
                toast.success("Chat deleted successfully");
                refetch();
              } catch {
                toast.error("Error occurred while deleting the chat");
              }
              toast.dismiss(); // Close the confirmation toast
            }}
            className="bg-[#333] text-[#fff] px-3 py-1 rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-300 text-[red] px-3 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>
    );

    toast.info(<ConfirmToast />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) {
      toast.error("No chat selected.");
      return;
    }

    try {
      await sendMessage({
        chatId: selectedChatId.toString(),
        token,
        content,
      });
      toast.success("Message sent successfully");
      reload_chat();
    } catch {
      toast.error("Error occurred while sending the message");
    }
  };

  // Update selected chat if URL changes
  useEffect(() => {
    if (chatId) {
      setSelectedChatId(parseInt(chatId));
    }
  }, [chatId]);

  return (
    <div className="flex flex-row h-screen">
      {/* Sidebar Chat List - 30% */}
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

      {/* Chat Window - 70% */}
      <div className="w-[70%] overflow-y-auto">
        {selectedChatId ? (
          <MainChatWindow
            chatId={selectedChatId}
            messages={single_room}
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
