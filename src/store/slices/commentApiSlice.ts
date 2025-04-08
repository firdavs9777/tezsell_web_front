import { SERVICES_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const commentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getComments: builder.query({
      query: ({ serviceId, token }: { serviceId: string; token: string }) => ({
        url: `${SERVICES_URL}/${serviceId}/comments`,
        headers: {
          Authorization: `Token ${token}`, // Pass token in headers
        },
        credentials: "include",
      }),
      invalidatesTags: ["Comment"],
    }),
    createComment: builder.mutation({
      query: ({
        text,
        serviceId,
        token,
      }: {
        text: string;
        serviceId: string;
        token: string;
      }) => {
        return {
          url: `${SERVICES_URL}/${serviceId}/comments/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          body: { text },
          credentials: "include",
        };
      },
      invalidatesTags: ["Comment"],
    }),
  }),
});

export const { useGetCommentsQuery, useCreateCommentMutation } =
  commentsApiSlice;
export default commentsApiSlice.reducer;
