import { createSlice, PayloadAction } from "@reduxjs/toolkit";


// Define the type for the state
export interface UserType {
    _id: string,
    name: string,
    email: string,
    password: string,
    isAdmin?: boolean,
    __v?: number,
    createdAt?: string,
    updatedAt?: string,
    matchPassword?: (arg1: string) => Promise<boolean>
    save: () => Promise<UserType>
  }
  export interface Response 
  {
    message?: string,
    token?: string,
    
  }
  

// Get the initial state from localStorage or use a default value
const initialState = {
    userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string)
    :  null
} 



const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
       setCredentials:(state,action: PayloadAction<Response>) => {
        state.userInfo = action.payload;
        if(action.payload)
        {
                localStorage.setItem('userInfo', JSON.stringify(action.payload));
        }
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
       },
       logout: (state, action: PayloadAction<Response>) => {
         state.userInfo = null;
         if (action.payload)
         {
           localStorage.clear();
           }
        // NOTE: here we need to also remove the cart from storage so the next
        // logged in user doesn't inherit the previous users cart and shipping
        localStorage.clear();
      },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;