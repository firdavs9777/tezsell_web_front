import {
  LOGGED_USER,
  LOGIN_URL,
  LOGOUT_URL,
  REFRESH_TOKEN_URL,
  REGISTER_URL,
  SEND_SMS,
  SERVICES_URL,
  USER_PERMISSIONS,
  USER_PRODUCT,
  USER_SERVICE,
  USERS_URL,
  VERIFY_SMS,
  VERIFY_TOKEN_URL,
} from "@store/constants";
import { apiSlice } from "@store/slices/apiSlice";
import { LoginInfo, RegisterInfo } from "@store/type";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    loginUser: builder.mutation({
      query: (data: LoginInfo) => ({
        url: `${LOGIN_URL}`,
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    registerUser: builder.mutation({
      query: (data: RegisterInfo) => ({
        url: `${REGISTER_URL}`,
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    logoutUser: builder.mutation({
      query: ({
        token,
        refresh_token,
      }: {
        token: string;
        refresh_token?: string;
      }) => ({
        url: `${LOGOUT_URL}`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`, // Attach the token to the Authorization header
        },
        body: refresh_token ? { refresh_token } : undefined,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    refreshToken: builder.mutation({
      query: (data: { refresh_token: string }) => ({
        url: `${REFRESH_TOKEN_URL}`,
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    verifyToken: builder.query({
      query: (token: string) => ({
        url: `${VERIFY_TOKEN_URL}`,
        headers: {
          Authorization: `Token ${token}`,
        },
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    getRegisteredUsers: builder.query({
      query: ({
        token,
        page = 1,
        pageSize = 20,
        search = "",
        userType = "",
        isActive = "",
        isStaff = "",
        region = "",
      }: {
        token: string;
        page?: number;
        pageSize?: number;
        search?: string;
        userType?: string;
        isActive?: string;
        isStaff?: string;
        region?: string;
      }) => {
        return {
          url: `${USERS_URL}/`,
          headers: {
            Authorization: `Token ${token}`,
          },
          params: {
            page,
            page_size: pageSize,
            search,
            user_type: userType,
            is_active: isActive,
            is_staff: isStaff,
            region,
          },
          credentials: "include",
        };
      },
      providesTags: ["Users"], // Changed from "Auth" to "Users" for better cache management
    }),
getUserDetail: builder.query({
  query: ({
    token,
    id,
  }: {
    token: string;
    id: string | number;
  }) => {
    return {
      url: `${USERS_URL}/${id}/`,
      headers: {
        Authorization: `Token ${token}`,
      },
      credentials: "include",
    };
  },
  providesTags: ["Users"],
}),
updateRegisteredUser: builder.mutation({
  query: ({
    token,
    id,
    data,
  }: {
    token: string;
    id: string | number;
    data: {
      username?: string;
      user_type?: string;
      is_active?: boolean;
      is_staff?: boolean;
      is_superuser?: boolean;
      is_verified_agent?: boolean;
      password?: string;
      location_id?: number;
    };
  }) => {
    return {
      url: `${USERS_URL}/${id}/`,
      method: 'PUT',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: data,
      credentials: "include",
    };
  },
  invalidatesTags: ["Users"],
}),
deleteRegisteredUser: builder.mutation({
  query: ({
    token,
    id,
  }: {
    token: string;
    id: string | number;
  }) => {
    return {
      url: `${USERS_URL}/${id}/`,
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
      credentials: "include",
    };
  },
  invalidatesTags: ["Users"],
}),
    getLoggedinUserInfo: builder.query({
      query: ({ token }: { token: string }) => {
        return {
          url: `${LOGGED_USER}/`,
          headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
    getUserPermissions: builder.query({
      query: ({ token }: { token: string }) => {
        return {
          url: `${USER_PERMISSIONS}/`,
          headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
    updateLoggedUserInfo: builder.mutation({
      query: ({ userData, token }: { userData: FormData; token: string }) => ({
        url: `${LOGGED_USER}/`,
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`, // Add token to the Authorization header
        },
        body: userData,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    sendSmsUser: builder.mutation({
      query: (phone_number: string) => ({
        url: `${SEND_SMS}`,
        method: "POST",
        body: phone_number,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    verifyCodeUser: builder.mutation({
      query: (phone_number: string, otp: string) => ({
        url: `${VERIFY_SMS}`,
        method: "POST",
        body: phone_number,
        otp,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    getUserProducts: builder.query({
      query: ({ token }: { token: string }) => {
        return {
          url: `${USER_PRODUCT}/`,
          headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
    getSingleUserProduct: builder.query({
      query: (productId: string) => ({
        url: `${USER_PRODUCT}/${productId}`,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Auth"],
    }),
    updateUserProduct: builder.mutation({
      query: ({
        productData,
        token,
        id,
      }: {
        productData: FormData;
        token: string;
        id: string;
      }) => {
        return {
          url: `${USER_PRODUCT}/${id}/`,
          method: "PUT",
          body: productData,
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
    deleteUserProduct: builder.mutation({
      query: ({ token, id }: { token: string; id: string }) => {
        return {
          url: `${USER_PRODUCT}/${id}/`,
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
    getUserServices: builder.query({
      query: ({ token }: { token: string }) => {
        return {
          url: `${USER_SERVICE}/`,
          headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
    deleteUserService: builder.mutation({
      query: ({ token, serviceId }: { token: string; serviceId: string }) => {
        return {
          url: `${SERVICES_URL}/${serviceId}/`,
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});
export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useVerifyTokenQuery,
  useSendSmsUserMutation,
  useVerifyCodeUserMutation,
  useGetUserProductsQuery,
  useUpdateUserProductMutation,
  useDeleteUserProductMutation,
  useGetSingleUserProductMutation,
  useGetUserServicesQuery,
  useGetLoggedinUserInfoQuery,
  useUpdateLoggedUserInfoMutation,
  useDeleteUserServiceMutation,
  useGetUserPermissionsQuery,
  useGetRegisteredUsersQuery,
  useGetUserDetailQuery,
  useDeleteRegisteredUserMutation,
  useUpdateRegisteredUserMutation
} = usersApiSlice;
