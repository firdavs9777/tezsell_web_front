import React from "react";
import { useTranslation } from "react-i18next";

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const { t, i18n } = useTranslation();

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return t("today") || "Today";
    }
    if (isYesterday) {
      return t("yesterday") || "Yesterday";
    }

    // Format based on locale
    return date.toLocaleDateString(i18n.language, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-200 text-gray-600 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
        {formatDate(date)}
      </div>
    </div>
  );
};

export default DateSeparator;
