import { REGISTER_URL, LOGIN_URL, LOGOUT_URL, SEND_SMS, VERIFY_SMS } from '../constants';
import { LoginInfo, RegisterInfo } from '../type';
import { apiSlice } from "./apiSlice";



export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder: any) => ({
        loginUser: builder.mutation({
            query: (data: LoginInfo) => ({
                url: `${LOGIN_URL}`,
                method: 'POST',
                body: data
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Auth']
        }),
        registerUser: builder.mutation({
            query: (data: RegisterInfo) => ({
                url: `${REGISTER_URL}`,
                method: 'POST',
                body: data
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Auth']
        }),
        logoutUser: builder.mutation({
            query: (token: string) => ({
                url: `${LOGOUT_URL}`,
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`, // Attach the token to the Authorization header
                },
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Auth']
        }),
        sendSmsUser: builder.mutation({
            query: (phone_number: string) => ({
                url: `${SEND_SMS}`,
                method: 'POST',
                body:phone_number
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Auth']
        }),
         verifyCodeUser: builder.mutation({
            query: (phone_number: string,otp: string) => ({
                 url: `${VERIFY_SMS}`,
                 method: 'POST',
                 body: phone_number, otp,
            }),
             keepUnusedDataFor: 5,
            provideTags: ['Auth']
        }),
    }),
});
export const { useLoginUserMutation, useRegisterUserMutation, useLogoutUserMutation, useSendSmsUserMutation, useVerifyCodeUserMutation } = usersApiSlice;