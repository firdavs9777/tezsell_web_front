import {
  COMMENTS_URL,
  DISLIKE_COMMENT,
  LIKE_COMMENT,
  SERVICES_URL,
} from "../constants";
import { apiSlice } from "./apiSlice";

export const commentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getComments: builder.query({
      query: ({ serviceId, token }: { serviceId: string; token: string }) => ({
        url: `${SERVICES_URL}/${serviceId}/comments/`,
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
    updateCommentItem: builder.mutation({
      query: ({
        text,
        serviceId,
        token,
        commentId,
      }: {
        text: string;
        serviceId: string;
        token: string;
        commentId: string;
      }) => ({
        url: `${SERVICES_URL}/${serviceId}/comments/${commentId}/`,
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`, // Add token to the Authorization header
        },
        body: { text },
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Comment"],
    }),
    deleteCommentItem: builder.mutation({
      query: ({
        serviceId,
        token,
        commentId,
      }: {
        serviceId: string;
        token: string;
        commentId: string;
      }) => ({
        url: `${SERVICES_URL}/${serviceId}/comments/${commentId}/`,
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`, // Add token to the Authorization header
        },
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Comment"],
    }),
    getReplies: builder.query({
      query: ({ commentId, token }: { commentId: string; token: string }) => ({
        url: `${COMMENTS_URL}/${commentId}/replies/`,
        headers: {
          Authorization: `Token ${token}`, // Pass token in headers
        },
        credentials: "include",
      }),
      invalidatesTags: ["Comment"],
    }),
    createReply: builder.mutation({
      query: ({
        text,
        commentId,
        token,
      }: {
        text: string;
        commentId: string;
        token: string;
      }) => {
        return {
          url: `${COMMENTS_URL}/${commentId}/replies/`,
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
    likeComment: builder.mutation({
      query: ({ commentId, token }: { commentId: string; token: string }) => {
        return {
          url: `${LIKE_COMMENT}${commentId}/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Comment"],
    }),
    unlikeComment: builder.mutation({
      query: ({ commentId, token }: { commentId: string; token: string }) => {
        return {
          url: `${DISLIKE_COMMENT}${commentId}/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Comment"],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentItemMutation,
  useDeleteCommentItemMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useGetRepliesQuery,
  useCreateReplyMutation,
} = commentsApiSlice;
export default commentsApiSlice.reducer;
