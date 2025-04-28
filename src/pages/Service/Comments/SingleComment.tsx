import React, { useState } from 'react';
import { Comment } from '@store/type';
import { FaUser, FaHeart, FaReply, FaChevronDown, FaChevronUp, FaThumbsUp } from 'react-icons/fa';
import { BASE_URL } from '@store/constants';
import MainReply from './Replies/MainReply';

interface SingleCommentProps {
  comment: Comment;
}

// Fake reply type structure
interface Reply {
  id: string;
  text: string;
  created_at: string;
  user: {
    username: string;
    profile_image?: { image: string } | null;
    location?: { region: string; district: string } | null;
  };
}

const SingleComment: React.FC<SingleCommentProps> = ({ comment }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 20));
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  
  // Mock replies data
  const [replies, setReplies] = useState<Reply[]>([
    {
      id: '1',
      text: 'Great point! I completely agree with your perspective.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user: {
        username: 'user123',
        profile_image: null,
        location: { region: 'New York', district: 'Manhattan' }
      }
    },
    {
      id: '2',
      text: 'Thanks for sharing this information. Very helpful!',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user: {
        username: 'traveler45',
        profile_image: null,
        location: { region: 'California', district: 'San Francisco' }
      }
    }
  ]);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      const newReply: Reply = {
        id: Date.now().toString(),
        text: replyText,
        created_at: new Date().toISOString(),
        user: {
          username: 'currentUser', // This would be the logged-in user
          profile_image: null,
          location: { region: 'Your Region', district: 'Your District' }
        }
      };
      setReplies([...replies, newReply]);
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true);
    }
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
          <p className="font-medium text-gray-800">
            {comment.user.username}
          </p>
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
          className={`flex items-center gap-1 ${liked ? ' text-blue-700' : ' text-gray-700'}  transition-colors`}
          onClick={handleLike}
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
            {showReplies ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        )}
      </div>
      
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-3 mb-3">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={2}
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
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
        <MainReply replies={replies} showReplies={showReplies}/>
      )}
    </div>
  );
};

export default SingleComment;