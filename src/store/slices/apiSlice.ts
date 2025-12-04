import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { BASE_URL, REFRESH_TOKEN_URL } from "@store/constants";
import type { RootState } from "@store/index";
import { updateTokens, logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get access token from state or localStorage
    const state = getState() as RootState;
    const accessToken =
      state.auth?.processedUserInfo?.access_token ||
      state.auth?.processedUserInfo?.token ||
      localStorage.getItem("access_token");

    if (accessToken) {
      headers.set("Authorization", `Token ${accessToken}`);
    }

    return headers;
  },
});

// Base query with token refresh logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      try {
        // Try to refresh the token
        const refreshResult = await baseQuery(
          {
            url: REFRESH_TOKEN_URL,
            method: "POST",
            body: { refresh_token: refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as any;
          // Store the new tokens
          api.dispatch(
            updateTokens({
              access_token: data.access_token,
              refresh_token: data.refresh_token || refreshToken,
              expires_in: data.expires_in,
              refresh_expires_in: data.refresh_expires_in,
            })
          );

          // Retry the original query with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, logout user
          api.dispatch(logout(undefined));
          // Redirect to login (handled by useAutoLogout or component)
        }
      } catch (error) {
        // Refresh failed, logout user
        api.dispatch(logout(undefined));
      }
    } else {
      // No refresh token, logout user
      api.dispatch(logout(undefined));
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api", // optional, but helps for clarity and advanced config
  baseQuery: baseQueryWithReauth,
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
