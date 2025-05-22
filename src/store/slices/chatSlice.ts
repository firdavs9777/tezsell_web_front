import { CHAT_MAIN } from "../constants";
import { apiSlice } from "./apiSlice";

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
}
export interface SingleChat {
  success: boolean;
  chat: Chat;
  messages: SingleMessage[];
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
      providesTags: ["Message"], // optional depending on use
    }),
    createChatRoom: builder.mutation<
      Chat,
      { name: string; participants: number[]; token: string }
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
