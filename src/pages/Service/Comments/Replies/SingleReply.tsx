import { Reply } from "@services/Comments/SingleComment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaEdit, FaEllipsisV, FaSave, FaTimes, FaTrash, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../../store";
import { BASE_URL } from "../../../../store/constants";
import { useDeleteReplyItemMutation, useUpdateReplyItemMutation } from "../../../../store/slices/commentApiSlice";

interface SingleReplyProps {
  reply: Reply;
  onReplyUpdate?: () => void;
  onReplyDelete?: () => void;
}

const SingleReply: React.FC<SingleReplyProps> = ({
  reply,
  onReplyUpdate,
  onReplyDelete
}) => {
  const [updateReply, { isLoading: updateLoading }] = useUpdateReplyItemMutation();
  const [deleteReply, { isLoading: deleteLoading }] = useDeleteReplyItemMutation();

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const isCommentOwner = userInfo?.user_info?.id === reply.user.id;

  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.text);

  const { t } = useTranslation();
  const optionsRef = React.useRef<HTMLDivElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUpdateReply = async () => {
    if (!token || !editText.trim()) {
      toast.error(t("enter_valid_reply"));
      return;
    }

    try {
      await updateReply({
        token,
        replyId: reply.id,
        text: editText.trim()
      }).unwrap();

      setIsEditing(false);
      toast.success(t("reply_update_success"));

      // Call the parent's refetch function
      if (onReplyUpdate) {
        onReplyUpdate();
      }
    } catch (error: any) {
      console.error("Update reply error:", error);
      toast.error(error?.data?.message || t("reply_update_error"));
    }
  };

  const handleDeleteReply = async () => {
    if (!token) {
      toast.error(t("authentication_required"));
      return;
    }

    const confirmDelete = window.confirm(t("reply_delete_confirmation"));
    if (!confirmDelete) return;

    try {
      await deleteReply({
        token,
        replyId: reply.id
      }).unwrap();

      toast.success(t("reply_delete_success"));

      // Call the parent's refetch function
      if (onReplyDelete) {
        onReplyDelete();
      }
    } catch (error: any) {
      console.error("Delete reply error:", error);
      toast.error(error?.data?.message || t("reply_delete_error"));
    }
  };

  const handleCancelEdit = () => {
    setEditText(reply.text);
    setIsEditing(false);
  };

  return (
    <div className="mt-3 bg-gray-50 rounded-lg p-3">
      <div className="flex items-start mb-2">
        <div className="mr-2 w-8 h-8 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {reply.user.profile_image?.image ? (
              <img
                src={`${BASE_URL}/${reply.user.profile_image?.image}`}
                alt={reply.user.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <FaUser className="text-gray-500" size={12} />
            )}
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {reply.user.username}
          </p>
          <p className="text-xs text-gray-500">
            {reply.user.location
              ? `${reply.user.location.region}, ${reply.user.location.district}`
              : ""}
          </p>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {new Date(reply.created_at).toLocaleString()}
        </div>

        {isCommentOwner && !isEditing && (
          <div className="relative ml-2" ref={optionsRef}>
            <button
              className="text-gray-500 hover:text-gray-700 ml-2"
              onClick={() => setShowOptions(!showOptions)}
              disabled={updateLoading || deleteLoading}
            >
              <FaEllipsisV size={16} />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md border border-gray-200 z-10 w-32">
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => {
                    setIsEditing(true);
                    setShowOptions(false);
                  }}
                  disabled={updateLoading || deleteLoading}
                >
                  <FaEdit size={14} /> {t("edit_label")}
                </button>
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={() => {
                    handleDeleteReply();
                    setShowOptions(false);
                  }}
                  disabled={updateLoading || deleteLoading}
                >
                  <FaTrash size={14} />
                  {deleteLoading ? t("deleting") : t("delete_label")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="pl-10">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
            rows={3}
            placeholder={t("reply_placeholder")}
            disabled={updateLoading}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdateReply}
              disabled={updateLoading || !editText.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave size={12} />
              {updateLoading ? t("saving") : t("save_label")}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={updateLoading}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
            >
              <FaTimes size={12} />
              {t("cancel_btn_label")}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 text-sm pl-10">{reply.text}</p>
      )}
    </div>
  );
};

export default SingleReply;
