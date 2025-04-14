import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  messageId: number | null;
}

const MainChatWindow: React.FC<MainChatWindowProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
}) => {
  const userId = useSelector(
    (state: RootState) => state.auth.userInfo?.user_info.id
  );
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });

  const handleSendMessage = async (content: string) => {
    if (newMessage.trim() === "") return;
    await onSendMessage(content);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, messageId: number) => {
    e.preventDefault();

    const messageElement = messageRefs.current[messageId];
    if (!messageElement) return;

    const menuWidth = 130; // Approximate width of context menu
    const menuHeight = 80; // Approximate height of context menu

    // Calculate position relative to viewport
    let x = e.clientX;
    let y = e.clientY;

    // Adjust if menu would go off screen
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight;
    }

    setContextMenu({
      visible: true,
      x: x,
      y: y,
      messageId,
    });
  };

  const handleDelete = () => {
    alert(`Delete message ${contextMenu.messageId}`);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleCopy = () => {
    const message = messages?.messages.find(
      (m) => m.id === contextMenu.messageId
    );
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  if (isLoading) return <div className="p-4">Loading messages...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading messages.</div>;

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300 relative">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages?.messages
          .slice()
          .reverse()
          .map((msg: any) => {
            const isMyMessage = msg.sender.id === userId;

            return (
              <div
                key={msg.id}
                onContextMenu={(e) => handleContextMenu(e, msg.id)}
                ref={(el) => (messageRefs.current[msg.id] = el)}
                className={`flex ${
                  isMyMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[300px] sm:max-w-md px-4 py-2 rounded-lg text-sm shadow cursor-pointer
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage(newMessage);
              setNewMessage("");
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage(newMessage)}
        />
        <button
          onClick={() => handleSendMessage(newMessage)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 shadow-lg rounded-md text-sm w-32 z-50"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 hover:bg-gray-100 text-left border-b border-gray-200"
          >
            Copy
          </button>
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 hover:bg-gray-100 text-left border-b border-gray-200"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MainChatWindow;
