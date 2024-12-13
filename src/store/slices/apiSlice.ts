import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants"

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // credentials: 'include', // Ensure credentials are included with every request
  //     prepareHeaders: (headers) => {
  //         headers.set('Content-Type', 'application/json');
  //         return headers;
  //     }
});

export const apiSlice = createApi({
  baseQuery,
   tagTypes: ['Product', 'Auth', 'Service'],
  endpoints: (builder: any) => ({}),
});