import {   REGISTER_URL, LOGIN_URL, LOGOUT_URL} from '../constants';
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
    })
    }),
});
export const { useLoginUserMutation, useRegisterUserMutation, useLogoutUserMutation } = usersApiSlice;