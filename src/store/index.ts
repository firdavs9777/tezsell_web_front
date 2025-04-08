// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import { persistStore, persistReducer } from "redux-persist";
import productsSliceReducer from "./slices/productsApiSlice";
import servicesSliceReducer from "./slices/serviceApiSlice";
import authSliceReducer from "./slices/authSlice";
import commentsSliceReducer from "./slices/commentApiSlice";
import storage from "redux-persist/lib/storage"; // This uses localStorage
import messagesApiSlice from "./slices/chatSlice";
const persistConfig = {
  key: "root", // You can name this as per your app's needs
  storage, // Use localStorage as the storage
  whitelist: ["product", "auth", "service", "comment"], // Define which slices to persist (e.g., 'product' and 'auth')
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
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});
const persistor = persistStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer.getState>;

export { rootReducer, persistor };
