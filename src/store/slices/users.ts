import {
  REGISTER_URL,
  LOGIN_URL,
  LOGOUT_URL,
  SEND_SMS,
  VERIFY_SMS,
  USER_PRODUCT,
} from "../constants";
import { LoginInfo, RegisterInfo } from "../type";
import { apiSlice } from "./apiSlice";

// interface GetUserProductsArgs {
//   token: string;
//   currentPage?: number;
//   page_size?: number;
//   category_name?: string;
//   region_name?: string;
//   district_name?: string;
//   product_title?: string;
// }

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
      query: (token: string) => ({
        url: `${LOGOUT_URL}`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`, // Attach the token to the Authorization header
        },
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
        console.log(token);
        return {
          url: `${USER_PRODUCT}`,
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
          url: `${USER_PRODUCT}/${id}`,
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
          url: `${USER_PRODUCT}/${id}`,
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
  useSendSmsUserMutation,
  useVerifyCodeUserMutation,
  useGetUserProductsQuery,
  useUpdateUserProductMutation,
  useDeleteUserProductMutation,
  useGetSingleUserProductMutation,
} = usersApiSlice;
