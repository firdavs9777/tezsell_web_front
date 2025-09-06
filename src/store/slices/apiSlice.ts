import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@store/constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, api) => {
    // Optional: const token = (api.getState() as RootState)?.auth?.token;
    // if (token) headers.set("Authorization", `Bearer ${token}`);

    const body = (api as any).body; // 👈 This is a workaround, see below

    // If not FormData, set Content-Type to JSON
    if (
      body &&
      typeof body === "object" &&
      body.constructor.name !== "FormData"
    ) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api", // optional, but helps for clarity and advanced config
  baseQuery,
  tagTypes: [
    "Product",
    "Auth",
    "Users",
    "Service",
    "Comment",
    "Message",
    // Real Estate Tags
    "Property",
    "Agent",
    "AgentData",
    "SavedProperty",
    "Admin",
    "AdminData",
    "Inquiry",
    "Location",
    "Stats",
    "RealEstate",
  ],
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
});
