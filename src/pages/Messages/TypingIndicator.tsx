import React from "react";
import { useTranslation } from "react-i18next";

interface TypingIndicatorProps {
  typingUsers?: string[];
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers = [],
  isVisible,
}) => {
  const { t } = useTranslation();

  if (!isVisible || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} ${t("is_typing") || "is typing"}`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} ${t("and") || "and"} ${typingUsers[1]} ${
        t("are_typing") || "are typing"
      }`;
    } else {
      return `${typingUsers.length} ${t("people_typing") || "people are typing"}`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1">
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-gray-500 italic">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
