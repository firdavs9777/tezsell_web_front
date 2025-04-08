import React, { useState, useRef, useEffect } from "react";
import { SingleChat } from "../../store/slices/chatSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface MainChatWindowProps {
  chat:
    | {
        id: number;
        name: string;
      }
    | undefined;
  messages: SingleChat | undefined;
  isLoading: boolean;
  error: any;
}

const MainChatWindow: React.FC<MainChatWindowProps> = ({
  chat,
  messages,
  isLoading,
  error,
}) => {
  const userId = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info.id
  );
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    console.log("Send:", newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) return <div className="p-4">Loading messages...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading messages.</div>;

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300 text-center">
      <h2 className="text-lg font-semibold mb-4">Chat: {chat?.name}</h2>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages?.messages
          .slice()
          .reverse()
          .map((msg) => {
            const isMyMessage = msg.sender.id === userId;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isMyMessage ? "justify-start" : "justify-end"
                } flex overflow-y-auto`}
              >
                <div
                  className={`max-w-[300px] sm:max-w-md px-4 py-2 rounded-lg text-sm shadow 
                ${
                  isMyMessage
                    ? "bg-green-200 text-left"
                    : "bg-blue-100 text-right"
                }`}
                >
                  <div className="mb-1">{msg.content}</div>
                  <div className="text-xs text-gray-600 flex justify-between gap-2">
                    <span>{msg.sender.username}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2 border-t pt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MainChatWindow;
