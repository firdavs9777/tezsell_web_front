import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants"

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
prepareHeaders: (headers) => {
          headers.set('Content-Type', 'application/json');
          return headers;
  },
  credentials: 'include',
});

export const apiSlice = createApi({
  baseQuery,
   tagTypes: ['Product', 'Auth', 'Service'],
  endpoints: (builder: any) => ({}),
});