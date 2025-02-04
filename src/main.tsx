import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import  { persistor, rootReducer } from './store/index.ts';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={rootReducer}>
      <PersistGate loading={null} persistor={persistor}>
    <App />      
    </PersistGate>
    </Provider>
  </StrictMode>,
)
