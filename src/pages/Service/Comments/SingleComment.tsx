import React, { useState } from "react";
import { Comment } from "@store/type";
import {
  FaUser,
  FaReply,
  FaChevronDown,
  FaChevronUp,
  FaThumbsUp,
  FaRegThumbsUp,
  FaEllipsisV,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { BASE_URL } from "@store/constants";
import MainReply from "./Replies/MainReply";
import {
  useCreateReplyMutation,
  useGetRepliesQuery,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useUpdateCommentItemMutation,
  useDeleteCommentItemMutation,
} from "@store/slices/commentApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { toast } from "react-toastify";
import { useGetFavoriteItemsQuery } from "@store/slices/productsApiSlice";
import { ServiceRes } from "@pages/Profile/MainProfile";
import { useTranslation } from "react-i18next";

interface SingleCommentProps {
  comment: Comment;
  onCommentUpdated?: () => void;
  onCommentDeleted?: () => void;
}

interface ReplyResponse {
  success: boolean;
  count: number;
  data: Reply[];
}

// Type for liked comments from API response
interface LikedComment {
  id: number;
  // Add other properties as needed
}

// Fake reply type structure
export interface Reply {
  id: number;
  text: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    user_type: string;
    phone_number: string;
    profile_image?: { image: string; alt_text: string } | null;
    location?: { country: string; region: string; district: string } | null;
    is_active: boolean;
  };
}

const SingleComment: React.FC<SingleCommentProps> = ({
  comment,
  onCommentUpdated,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const token = userInfo?.token;
  const id = comment.id.toString();
  const { data, refetch } = useGetRepliesQuery({
    commentId: id,
    token: token,
  });

  const repliesResponse = data as ReplyResponse | undefined;
  const replies: Reply[] = repliesResponse?.data || [];
  const [createReply, { isLoading: create_loading }] = useCreateReplyMutation();
  const [updateComment, { isLoading: updateLoading }] =
    useUpdateCommentItemMutation();
  const [deleteComment] = useDeleteCommentItemMutation();

  const [showReplies, setShowReplies] = useState(false);

  const isLoggedIn = !!userInfo;
  const isCommentOwner = userInfo?.user_info?.id === comment.user.id;

  const {
    data: favorite_items,

    refetch: reload_fav,
  } = useGetFavoriteItemsQuery(
    {
      token: token,
    },
    { skip: !isLoggedIn }
  ); // Skip query if user is not logged in

  const [likeComment, { isLoading: likeLoading }] = useLikeCommentMutation();
  const [dislikeComment, { isLoading: dislikeLoading }] =
    useUnlikeCommentMutation();

  // Type assertion for favorite_items
  const likedItemsData = favorite_items as ServiceRes | undefined;

  // Check if the current comment is liked by the user
  const isCommentLiked = React.useMemo(() => {
    if (!likedItemsData?.liked_comments) return false;

    // Use type assertion to ensure correct type
    const likedComments =
      likedItemsData.liked_comments as unknown as LikedComment[];
    return likedComments.some((item) => item.id === comment.id);
  }, [likedItemsData?.liked_comments, comment.id]);

  // Handle clicking outside of the options menu to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLikeComment = async () => {
    try {
      const response = await likeComment({
        commentId: comment.id,
        token,
      });

      if (response.data) {
        toast.success(t("comment_like_success"), { autoClose: 1000 });
        reload_fav();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("comment_like_error"), { autoClose: 1000 });
      } else {
        toast.error(t("unknown_error_message"), { autoClose: 1000 });
      }
    }
  };

  const handleDislikeComment = async () => {
    try {
      const response = await dislikeComment({
        commentId: comment.id,
        token,
      });

      if (response.data) {
        toast.success(t("comment_dislike_success"), { autoClose: 1000 });
        reload_fav();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("comment_dislike_error"), { autoClose: 1000 });
      } else {
        toast.error(t("unknown_error_message"), { autoClose: 1000 });
      }
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.info(t("reply_info"));
      return;
    }

    try {
      const response = await createReply({
        text: replyText,
        commentId: comment.id,
        token,
      });
      if (response.data) {
        toast.success(t("reply_success_message"), { autoClose: 2000 });
        refetch();
        setReplyText("");
      } else {
        toast.error(t("reply_error_message"), { autoClose: 2000 });
      }
      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("reply_error_message"), { autoClose: 2000 });
      } else {
        toast.error(t("unknown_error_message"), { autoClose: 1000 });
      }
    }
  };

  const handleEditComment = async () => {
    if (!editedText.trim() || editedText === comment.text) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await updateComment({
        serviceId: comment.service_id,
        commentId: comment.id,
        text: editedText,
        token,
      });

      if (response.data) {
        toast.success(t("comment_update_success"), { autoClose: 2000 });
        if (onCommentUpdated) {
          onCommentUpdated();
        }
        setIsEditing(false);
      } else {
        toast.error(t("comment_update_error"), { autoClose: 2000 });
        setEditedText(comment.text); // Reset to original text
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("comment_update_error"), { autoClose: 2000 });
      } else {
        toast.error(t("unknown_error_message"), { autoClose: 1000 });
      }
      setEditedText(comment.text); // Reset to original text
    }
  };
  const handleDeleteComment = async () => {
    const confirmed = window.confirm(t("delete_confirmation_message"));
    if (!confirmed) return;

    try {
      const response = await deleteComment({
        serviceId: comment.service_id,
        commentId: comment.id,
        token,
      });

      if (response) {
        toast.success(t("comment_delete_success"), { autoClose: 2000 });
        onCommentUpdated?.(); // optional chaining, cleaner
      } else {
        toast.error(t("comment_delete_error"), { autoClose: 2000 });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("comment_delete_error"), { autoClose: 2000 });
      } else {
        toast.error(t("unknown_error_message"), { autoClose: 1000 });
      }
    }
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleReplySubmit();
  };

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm mb-4">
      <div className="flex items-start mb-3">
        <div className="mr-3 w-10 h-10 flex-shrink-0">
          {comment.user.profile_image != null ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={`${BASE_URL}/${comment.user.profile_image.image}`}
                alt={comment.user.username}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUser className="text-gray-500" size={16} />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">{comment.user.username}</p>
          <p className="text-xs text-gray-500">
            {comment.user.location
              ? `${comment.user.location.region}, ${comment.user.location.district}`
              : ""}
          </p>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {new Date(comment.created_at).toLocaleString()}
        </div>

        {/* Comment options menu for edit/delete */}
        {isCommentOwner && (
          <div className="relative ml-2" ref={optionsRef}>
            <button
              className="text-gray-500 hover:text-gray-700 ml-2"
              onClick={() => setShowOptions(!showOptions)}
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
                >
                  <FaEdit size={14} /> {t("edit_label")}
                </button>
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={() => {
                    handleDeleteComment();
                    setShowOptions(false);
                  }}
                >
                  <FaTrash size={14} /> {t("delete_label")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment text or edit form */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={3}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsEditing(false);
                setEditedText(comment.text); // Reset to original text
              }}
            >
              {t("cancel_btn_label")}
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              onClick={handleEditComment}
              disabled={
                updateLoading ||
                !editedText.trim() ||
                editedText === comment.text
              }
            >
              {t("save_label")}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 mb-4">{comment.text}</p>
      )}

      <div className="flex items-center gap-6 text-sm pb-3 border-b border-gray-100">
        {isCommentLiked ? (
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleDislikeComment}
            disabled={dislikeLoading}
          >
            <FaThumbsUp />
          </button>
        ) : (
          <button
            className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={handleLikeComment}
            disabled={likeLoading}
          >
            <FaRegThumbsUp />
          </button>
        )}
        <button
          className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <FaReply /> <span> {t("reply_label")}</span>
        </button>

        {replies.length > 0 && (
          <button
            className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors ml-auto"
            onClick={() => setShowReplies(!showReplies)}
          >
            <span>
              {replies.length} {t("reply_title")}
            </span>
            {showReplies ? (
              <FaChevronUp size={12} />
            ) : (
              <FaChevronDown size={12} />
            )}
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={submitFormHandler} className="mt-3 mb-3">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={2}
            placeholder={t("reply_placeholder")}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReplySubmit();
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setShowReplyForm(false)}
            >
              {t("cancel_btn_label")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={!replyText.trim() || create_loading}
            >
              {t("reply_label")}
            </button>
          </div>
        </form>
      )}

      {showReplies && replies.length > 0 && (
        <MainReply replies={replies} showReplies={showReplies} />
      )}
    </div>
  );
};

export default SingleComment;
