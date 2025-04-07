import { CHAT_ROOM_URL } from '../constants';
import { apiSlice } from "./apiSlice";

export const chatsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getChatRooms: builder.query({
      query: ({ token }: { token: string }) => ({
        url: `${CHAT_ROOM_URL}`,
        headers: {
          Authorization: `Token ${token}`, // Pass token in headers
        },
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const { useGetChatRoomsQuery } = chatsApiSlice;
export default chatsApiSlice.reducer;
