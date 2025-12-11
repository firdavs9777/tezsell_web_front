import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { apiSlice } from "./slices/apiSlice";

import authSliceReducer from "@store/slices/authSlice";
import messagesApiSlice from "@store/slices/chatSlice";
import commentsSliceReducer from "@store/slices/commentApiSlice";
import productsSliceReducer from "@store/slices/productsApiSlice";
import servicesSliceReducer from "@store/slices/serviceApiSlice";
import realEstateApiSlice from "@store/slices/realEstate";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 2, // ADD THIS - increment when you want to invalidate old cache
  storage,
  whitelist: ["auth"], // Only persist auth, not product data
  migrate: (state: any) => {
    // Clear old cache on version change
    return Promise.resolve(state);
  },
};

const persistedAuthReducer = persistReducer(persistConfig, authSliceReducer);

// DON'T persist product/service/real estate data - they should always be fresh from API
const rootReducer = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    product: productsSliceReducer, // REMOVED persist
    service: servicesSliceReducer, // REMOVED persist
    auth: persistedAuthReducer, // KEEP persist for auth only
    comment: commentsSliceReducer, // REMOVED persist
    real_estate: realEstateApiSlice, // REMOVED persist
    messsage: messagesApiSlice, // REMOVED persist
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
  devTools: true,
});

const persistor = persistStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer.getState>;

export { persistor, rootReducer };
