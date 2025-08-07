import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@store/type";


export interface UserType {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  matchPassword?: (arg1: string) => Promise<boolean>;
  save: () => Promise<UserType>;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user_info?: User,
  user?: UserType;

}

export interface AuthState {
  userInfo: AuthResponse | null;
}


const getStoredUserInfo = (): AuthResponse | null => {
  try {
    const storedInfo = localStorage.getItem("userInfo");
    return storedInfo ? JSON.parse(storedInfo) : null;
  } catch (error) {
    console.error("Error parsing stored user info:", error);
    localStorage.removeItem("userInfo");
    return null;
  }
};


const initialState: AuthState = {
  userInfo: getStoredUserInfo(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.userInfo = action.payload;
      try {
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      } catch (error) {
        console.error("Error storing user info:", error);
      }
    },

    logout: (state, action?: PayloadAction<AuthResponse | undefined>) => {
      console.log(action)
      state.userInfo = null;
      try {
        localStorage.removeItem("userInfo");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
    },


    updateUserInfo: (state, action: PayloadAction<Partial<AuthResponse>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };

        try {
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        } catch (error) {
          console.error("Error updating stored user info:", error);
        }
      }
    },


    clearAuth: (state) => {
      state.userInfo = null;
      try {
        localStorage.removeItem("userInfo");
      } catch (error) {
        console.error("Error clearing auth:", error);
      }
    },


    syncWithStorage: (state) => {
      const storedInfo = getStoredUserInfo();
      state.userInfo = storedInfo;
    },
  },
});

export const {
  setCredentials,
  logout,
  updateUserInfo,
  clearAuth,
  syncWithStorage
} = authSlice.actions;

export default authSlice.reducer;
