import React, { useState } from "react";
import { Comment } from "@store/type";
import {
  FaUser,
  FaHeart,
  FaReply,
  FaChevronDown,
  FaChevronUp,
  FaThumbsUp,
} from "react-icons/fa";
import { BASE_URL } from "@store/constants";
import MainReply from "./Replies/MainReply";
import {
  useCreateReplyMutation,
  useGetRepliesQuery,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} from "@store/slices/commentApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { toast } from "react-toastify";
import { useGetFavoriteItemsQuery } from "@store/slices/productsApiSlice";
import { ServiceRes } from "@pages/Profile/MainProfile";

interface SingleCommentProps {
  comment: Comment;
}
interface ReplyResponse {
  success: boolean;
  count: number;
  data: Reply[];
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

const SingleComment: React.FC<SingleCommentProps> = ({ comment }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 20));
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const token = userInfo?.token;
  const id = comment.id.toString();
  const { data, isLoading, error, refetch } = useGetRepliesQuery({
    commentId: id,
    token: token,
  });

  const repliesResponse = data as ReplyResponse | undefined;
  const replies: Reply[] = repliesResponse?.data || [];
  const [createReply, { isLoading: create_loading }] = useCreateReplyMutation();

  const [showReplies, setShowReplies] = useState(false);

  const isLoggedIn = !!userInfo;
  const {
    data: favorite_items,
    isLoading: favorite_loading,
    error: favorite_error,
    refetch: reload_fav,
  } = useGetFavoriteItemsQuery(
    {
      token: token,
    },
    { skip: !isLoggedIn }
  ); // Skip query if user is not logged in

  const [likeComment, { isLoading: create_loading_like }] =
    useLikeCommentMutation();
  const [dislikeComment, { isLoading: create_loading_dislike }] =
    useUnlikeCommentMutation();
  // Mock replies data
  const liked_items: ServiceRes = favorite_items as ServiceRes;

  const handleLikeComment = async () => {
    try {
      const token = userInfo?.token;
      const response = await likeComment({
        commentId: comment.id,
        token: token,
      });

      if (response.data) {
        toast.success("Comment liked successfully", { autoClose: 1000 });
        // refetch();
        // reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating product", {
          autoClose: 1000,
        });
      } else {
        toast.error("An unknown error occurred while creating the product", {
          autoClose: 3000,
        });
      }
    }
  };
  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.info("Please enter a reply first");
      return;
    }

    try {
      const response = await createReply({
        text: replyText,
        commentId: comment.id,
        token,
      });
      if (response.data) {
        toast.success("Comment created successfully");
        refetch();
        setReplyText("");
      } else {
        toast.error("Error occurred during the creation");
      }
      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating comment");
      } else {
        toast.error("An unknown error occurred");
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
      </div>

      <p className="text-gray-700 mb-4">{comment.text}</p>

      <div className="flex items-center gap-6 text-sm pb-3 border-b border-gray-100">
        <button
          className={`flex items-center gap-1 ${
            liked ? " text-blue-700" : " text-gray-700"
          }  transition-colors`}
          onClick={handleLikeComment}
        >
          <FaThumbsUp /> <span>{likeCount}</span>
        </button>
        <button
          className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <FaReply /> <span>Reply</span>
        </button>

        {replies.length > 0 && (
          <button
            className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors ml-auto"
            onClick={() => setShowReplies(!showReplies)}
          >
            <span>{replies.length} replies</span>
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
            placeholder="Write a reply..."
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={!replyText.trim()}
            >
              Reply
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
