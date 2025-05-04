import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 30000,
  prepareHeaders: (headers, { getState, endpoint, body }) => {
    // Example: Add token from state if needed
    // const token = getState().auth?.token;
    // if (token) headers.set("Authorization", `Bearer ${token}`);

    // If not FormData, set Content-Type to JSON
    if (!(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api", // optional, but helps for clarity and advanced config
  baseQuery,
  tagTypes: ["Product", "Auth", "Service", "Comment", "Message"],
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
});
