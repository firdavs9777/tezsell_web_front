// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';

import productsSliceReducer from './slices/productsApiSlice';
import servicesSliceReducer from './slices/serviceApiSlice';
import authSliceReducer from './slices/authSlice';

const rootReducer = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    product: productsSliceReducer,
    service: servicesSliceReducer,
    auth: authSliceReducer
  },
  middleware:(getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true
});
export type RootState = ReturnType<typeof rootReducer.getState>;

export default rootReducer;


