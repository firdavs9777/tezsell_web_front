import { CHAT_MAIN } from "@store/constants";
import { apiSlice } from "@store/slices/apiSlice";

export interface ChatParticipant {
  id: number;
  username: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Chat {
  id: number;
  name: string;
  is_group: boolean;
  participants: ChatParticipant[];
  last_message: {
    id: number;
    content: string;
    message_type: "text" | "image" | "voice" | "system";
    timestamp: string;
    updated_at?: string;
    sender: {
      id: number;
      username: string;
      is_online?: boolean;
      last_seen?: string | null;
    };
    file?: string | null;
    file_url?: string | null;
    duration?: number | null;
    is_read?: boolean;
    is_edited?: boolean;
    is_deleted?: boolean;
    read_by?: number[];
    reply_to?: number | null;
    reactions?: Record<string, number[]>;
  } | null;
  last_message_preview?: string;
  unread_count: number;
  created_at?: string;
  updated_at?: string;
  already_exists?: boolean;
}

export interface ChatResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: Chat[];
}

export interface successResponse {
  success: boolean;
  message: string;
}

export interface Message {
  id: number;
  content: string;
  message_type: "text" | "image" | "voice" | "system";
  timestamp: string;
  updated_at?: string;
  sender: {
    id: number;
    username: string;
    is_online?: boolean;
    last_seen?: string;
  };
  file?: string | null;
  file_url?: string | null;
  duration?: number | null;
  is_read?: boolean;
  is_edited?: boolean;
  is_deleted?: boolean;
  read_by?: number[];
  reactions?: Record<string, number[]>;
  reply_to?: number | Message | null;
}

export interface MessagesResponse {
  results: Message[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface SingleMessage {
  id: number;
  content: string;
  message_type: "text" | "image" | "voice" | "system";
  timestamp: string;
  sender: {
    id: number;
    username: string;
  };
  file?: {
    url: string;
    type: "image" | "audio" | "video" | "file";
  };
  file_url?: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  reactions?: Record<string, number[]>;
  reply_to?: number | Message | null;
}

export interface SingleChat {
  id: number;
  name: string;
  is_group: boolean;
  participants: ChatParticipant[];
  created_at?: string;
  updated_at?: string;
}

export interface SearchUserResult {
  id: number;
  username: string;
  is_online: boolean;
  last_seen: string;
  has_existing_chat: boolean;
  existing_chat_id?: number;
}

export interface SearchUsersResponse {
  results: SearchUserResult[];
  count: number;
}

export interface StartChatResponse {
  success: boolean;
  chat: Chat;
}

export interface DirectChatResponse {
  id: number;
  name: string;
  is_group: boolean;
  participants: ChatParticipant[];
}

export interface ReactionResponse {
  success: boolean;
  message_id: number;
  reactions: Record<string, number[]>;
}

export interface TypingStatus {
  typing_users: Array<{
    user: {
      id: number;
      username: string;
    };
    is_typing: boolean;
    last_activity: string;
  }>;
}
export const messagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Chat List
    getAllChatMessages: builder.query<ChatResponse, { token: string }>({
      query: ({ token }) => ({
        url: `${CHAT_MAIN}/`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      keepUnusedDataFor: 30,
      providesTags: ["Message"],
    }),

    // Create Group Chat
    createChatRoom: builder.mutation<
      Chat,
      { name: string; participants: number[]; token: string }
    >({
      query: ({ name, participants, token }) => ({
        url: `${CHAT_MAIN}/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { name, participants },
        credentials: "include",
      }),
      invalidatesTags: ["Message"],
    }),

    // Search Users
    searchUsers: builder.query<
      SearchUsersResponse,
      { query: string; token: string }
    >({
      query: ({ query, token }) => ({
        url: `${CHAT_MAIN}/search-users/`,
        params: { query },
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      keepUnusedDataFor: 5,
    }),

    // Start Chat with User (KakaoTalk-style)
    startChatWithUser: builder.query<
      StartChatResponse,
      { userId: number; token: string }
    >({
      query: ({ userId, token }) => ({
        url: `${CHAT_MAIN}/start/${userId}/`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Message"],
    }),

    // Get or Create Direct Chat
    getOrCreateDirectChat: builder.mutation<
      DirectChatResponse,
      { user_id: number; token: string }
    >({
      query: ({ user_id, token }) => ({
        url: `${CHAT_MAIN}/direct/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { user_id },
        credentials: "include",
      }),
      invalidatesTags: ["Message"],
    }),

    // Get Chat Details
    getSingleChatMessages: builder.query<
      SingleChat,
      { chatId: string; token: string }
    >({
      query: ({ chatId, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
      providesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: chatId },
      ],
    }),

    // Delete Chat
    deleteSingleChatRoom: builder.mutation<
      successResponse,
      { chatId: string; token: string }
    >({
      query: ({ chatId, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/`,
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      invalidatesTags: ["Message"],
    }),

    // Get Messages (with pagination)
    getMessages: builder.query<
      MessagesResponse,
      { chatId: string; token: string; page?: number; page_size?: number }
    >({
      query: ({ chatId, token, page = 1, page_size = 20 }) => ({
        url: `${CHAT_MAIN}/${chatId}/messages/`,
        params: { page, page_size },
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
      providesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `messages-${chatId}` },
      ],
    }),

    // Send Message
    createChatRoomMessage: builder.mutation<
      Message,
      {
        chatId: string;
        token: string;
        content?: string;
        message_type?: "text" | "image" | "voice";
        file?: File;
        duration?: number;
        reply_to?: number;
      }
    >({
      query: ({ chatId, token, content, message_type = "text", file, duration, reply_to }) => {
        const formData = new FormData();
        if (content) formData.append("content", content);
        formData.append("message_type", message_type);
        if (file) formData.append("file", file);
        if (duration) formData.append("duration", duration.toString());
        if (reply_to) formData.append("reply_to", reply_to.toString());

        return {
          url: `${CHAT_MAIN}/${chatId}/messages/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `messages-${chatId}` },
        "Message",
      ],
    }),

    // Edit Message
    editMessage: builder.mutation<
      Message,
      { chatId: string; messageId: number; content: string; token: string }
    >({
      query: ({ chatId, messageId, content, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/messages/${messageId}/`,
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { content },
        credentials: "include",
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `messages-${chatId}` },
      ],
    }),

    // Delete Message
    deleteMessage: builder.mutation<
      successResponse,
      { chatId: string; messageId: number; token: string }
    >({
      query: ({ chatId, messageId, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/messages/${messageId}/`,
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `messages-${chatId}` },
      ],
    }),

    // Add/Remove Message Reaction
    toggleReaction: builder.mutation<
      ReactionResponse,
      { chatId: string; messageId: number; emoji: string; token: string }
    >({
      query: ({ chatId, messageId, emoji, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/messages/${messageId}/reaction/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { emoji },
        credentials: "include",
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Message", id: `messages-${chatId}` },
      ],
    }),

    // Block User
    blockUser: builder.mutation<
      successResponse,
      { user_id: number; token: string }
    >({
      query: ({ user_id, token }) => ({
        url: `${CHAT_MAIN}/block/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { user_id },
        credentials: "include",
      }),
    }),

    // Unblock User
    unblockUser: builder.mutation<
      successResponse,
      { user_id: number; token: string }
    >({
      query: ({ user_id, token }) => ({
        url: `${CHAT_MAIN}/block/`,
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { user_id },
        credentials: "include",
      }),
    }),

    // Get Blocked Users
    getBlockedUsers: builder.query<
      { blocked_users: Array<{ id: number; blocked_user: { id: number; username: string }; created_at: string }> },
      { token: string }
    >({
      query: ({ token }) => ({
        url: `${CHAT_MAIN}/blocked/`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
    }),

    // Update Typing Status
    updateTypingStatus: builder.mutation<
      { success: boolean; is_typing: boolean },
      { chatId: string; is_typing: boolean; token: string }
    >({
      query: ({ chatId, is_typing, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/typing/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: { is_typing },
        credentials: "include",
      }),
    }),

    // Get Typing Status
    getTypingStatus: builder.query<
      TypingStatus,
      { chatId: string; token: string }
    >({
      query: ({ chatId, token }) => ({
        url: `${CHAT_MAIN}/${chatId}/typing/`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetAllChatMessagesQuery,
  useGetSingleChatMessagesQuery,
  useCreateChatRoomMutation,
  useDeleteSingleChatRoomMutation,
  useCreateChatRoomMessageMutation,
  useSearchUsersQuery,
  useStartChatWithUserQuery,
  useGetOrCreateDirectChatMutation,
  useGetMessagesQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useToggleReactionMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetBlockedUsersQuery,
  useUpdateTypingStatusMutation,
  useGetTypingStatusQuery,
} = messagesApiSlice;
export default messagesApiSlice.reducer;
