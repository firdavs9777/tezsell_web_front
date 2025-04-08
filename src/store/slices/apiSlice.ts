import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState, endpoint, body }) => {
    //  if (body instanceof FormData) {
    //     // No need to set Content-Type when using FormData as it's handled automatically
    //     return headers;
    //   }
    //   headers.set('Content-Type', 'application/json');
    //   return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Product", "Auth", "Service", "Comment", "Message"],
  endpoints: (builder: any) => ({}),
});
