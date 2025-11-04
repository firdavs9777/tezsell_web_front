import { CHAT_MAIN } from "@store/constants";
import { apiSlice } from "@store/slices/apiSlice";
import { User } from "@store/type";

export interface Chat {
  id: number;
  name: string;
  participants: number[];
  last_message: {
    id: number;
    content: string;
    timestamp: string;
    sender: {
      id: number;
      username: string;
    };
  } | null;
  unread_count: number;
}
export interface ChatResponse {
  count?: number;
  next?: number | null;
  previous?: number | null;
  results: Chat[];
}
export interface successResponse {
  success: boolean;
  message: string;
}

export interface SingleMessage {
  id: number;
  content: string;
  timestamp: string;
  sender: {
    id: number;
    username: string;
  };
  file?: {
    url: string;
    type: "image" | "audio" | "video" | "file";
  };
}
export interface SingleChat {
  success: boolean;
  chat: Chat;
  messages: SingleMessage[];
  participants: User[];
}
export const messagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllChatMessages: builder.query<ChatResponse, { token: string }>({
      query: ({ token }) => ({
        url: `${CHAT_MAIN}/`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      keepUnusedDataFor: 30,
      providesTags: ["Message"], // optional depending on use
    }),
    createChatRoom: builder.mutation<
      Chat,
      { name: string; participants: number[]; token?: string }
    >({
      query: ({ name, participants, token }) => ({
        url: `${CHAT_MAIN}/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`, // Add token to the Authorization header
        },
        body: { name, participants },
        credentials: "include",
      }),

      invalidatesTags: ["Message"],
    }),
    getSingleChatMessages: builder.query<
      ChatResponse,
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
      providesTags: ["Message"], // optional depending on use
    }),
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
      invalidatesTags: ["Message"], // optional depending on use
    }),
    createChatRoomMessage: builder.mutation<
      SingleMessage,
      { chatId: string; token: string; content: string }
    >({
      query: ({ chatId, token, content }) => ({
        url: `${CHAT_MAIN}/${chatId}/messages/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: { content },
        credentials: "include",
      }),
      invalidatesTags: ["Message"], // optional depending on use
    }),
  }),
});

export const {
  useGetAllChatMessagesQuery,
  useGetSingleChatMessagesQuery,
  useCreateChatRoomMutation,
  useDeleteSingleChatRoomMutation,
  useCreateChatRoomMessageMutation,
} = messagesApiSlice;
export default messagesApiSlice.reducer;
