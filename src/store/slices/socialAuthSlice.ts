import { GOOGLE_AUTH_URL, SOCIAL_ACCOUNTS_URL, GOOGLE_LINK_URL } from "@store/constants";
import { apiSlice } from "@store/slices/apiSlice";
import { AuthResponse } from "@store/slices/authSlice";

// The backend's social login response (accounts/social_views/base.py
// build_login_response) is the standard login shape plus social-specific flags.
export interface SocialAuthResponse extends AuthResponse {
  is_new_user?: boolean;
  is_new_link?: boolean;
  error?: string;
}

export interface SocialAccount {
  provider: string;
  email: string;
  linked_at: string;
}

export const socialAuthApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Google Sign-In
    googleSignIn: builder.mutation<SocialAuthResponse, { id_token: string; photo_url?: string }>({
      query: (data) => ({
        url: GOOGLE_AUTH_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Get linked social accounts
    getLinkedAccounts: builder.query<{ success: boolean; data: SocialAccount[] }, { token: string }>({
      query: ({ token }) => ({
        url: SOCIAL_ACCOUNTS_URL,
        headers: {
          Authorization: `Token ${token}`,
        },
      }),
      providesTags: ["Auth"],
    }),

    // Link Google account to existing account
    linkGoogleAccount: builder.mutation<
      { success: boolean; message?: string; error?: string },
      { token: string; id_token: string }
    >({
      query: ({ token, id_token }) => ({
        url: GOOGLE_LINK_URL,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: { id_token },
      }),
      invalidatesTags: ["Auth"],
    }),

    // Unlink social account
    unlinkSocialAccount: builder.mutation<
      { success: boolean; message?: string; error?: string },
      { token: string; provider: string }
    >({
      query: ({ token, provider }) => ({
        url: SOCIAL_ACCOUNTS_URL,
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: { provider },
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGoogleSignInMutation,
  useGetLinkedAccountsQuery,
  useLinkGoogleAccountMutation,
  useUnlinkSocialAccountMutation,
} = socialAuthApiSlice;
