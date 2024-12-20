import { REGISTER_URL, LOGIN_URL, LOGOUT_URL, SEND_SMS, VERIFY_SMS } from '../constants';
import { apiSlice } from "./apiSlice";


export interface AuthInfo {
    phone_number: string;
    password: string;
}

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder: any) => ({
        loginUser: builder.mutation({
            query: (data: AuthInfo) => ({
                url: `${LOGIN_URL}`,
                method: 'POST',
                body: data
            }),
            keepUnusedDataFor: 5
        }),
        registerUser: builder.mutation({
            query: (data: AuthInfo) => ({
                url: `${REGISTER_URL}`,
                method: 'POST',
                body: data
            }),
            keepUnusedDataFor: 5
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
        }),
        sendSmsUser: builder.mutation({
            query: (phone_number: string) => ({
                url: `${SEND_SMS}`,
                method: 'POST',
                body:phone_number
            }),
            keepUnusedDataFor: 5,
        }),
         verifyCodeUser: builder.mutation({
            query: (otp: string) => ({
                url: `${VERIFY_SMS}`,
                method: 'POST',
                 body: { otp },
                credentials:'include'
            }),
            keepUnusedDataFor: 5,
        }),
    }),
});
export const { useLoginUserMutation, useRegisterUserMutation, useLogoutUserMutation, useSendSmsUserMutation, useVerifyCodeUserMutation } = usersApiSlice;