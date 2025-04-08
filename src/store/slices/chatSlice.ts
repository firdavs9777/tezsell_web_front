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
}
export interface ChatResponse {
  count?: number;
  next?: number | null;
  previous?: number | null;
  results: Chat[];
}

export interface SingleMessage {
  id: number;
  content: string;
  timestamp: string;
  sender: {
    id: number;
    username: string;
  }
}
export interface SingleChat {
  success: boolean;
  chat: Chat;
  messages:SingleMessage[] 
}
export const messagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllChatMessages: builder.query<ChatResponse, { token: string }>({
      query: ({ token }) => ({
        url: `${CHAT_MAIN}`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      providesTags: ["Message"], // optional depending on use
    }),
    getSingleChatMessages: builder.query<ChatResponse, {chatId: string, token: string }>({
      query: ({ chatId, token }) => ({
        url: `${CHAT_MAIN}/${chatId}`,
        headers: {
          Authorization: `Token ${token}`,
        },
        credentials: "include",
      }),
      providesTags: ["Message"], // optional depending on use
    }),
  }),
});

export const { useGetAllChatMessagesQuery, useGetSingleChatMessagesQuery } = messagesApiSlice;
export default messagesApiSlice.reducer;
