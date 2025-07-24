// src/store/index.ts
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
import storage from "redux-persist/lib/storage"; // This uses localStorage
const persistConfig = {
  key: "root", // You can name this as per your app's needs
  storage, // Use localStorage as the storage
  whitelist: ["auth"], // Define which slices to persist (e.g., 'product' and 'auth')
};

const persistedProductReducer = persistReducer(
  persistConfig,
  productsSliceReducer
);
const persistedAuthReducer = persistReducer(persistConfig, authSliceReducer);
const persistedServiceReducer = persistReducer(
  persistConfig,
  servicesSliceReducer
);
const persistedCommentReducer = persistReducer(
  persistConfig,
  commentsSliceReducer
);
const persistedMessageReducer = persistReducer(persistConfig, messagesApiSlice);
const rootReducer = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    product: persistedProductReducer,
    service: persistedServiceReducer,
    auth: persistedAuthReducer,
    comment: persistedCommentReducer,
    messsage: persistedMessageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // This is important to prevent serialization issues with RTK Query
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
  devTools: true,
});
const persistor = persistStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer.getState>;

export { persistor, rootReducer };
