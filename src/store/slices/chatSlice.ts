import { CHAT_MAIN, SERVICES_URL } from "../constants";
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
  }),
});

export const { useGetAllChatMessagesQuery } = messagesApiSlice;
export default messagesApiSlice.reducer;
