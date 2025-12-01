import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import { apiSlice } from './slices/apiSlice';

// Configuration de la persistence
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth'], // Seul le state auth sera persisté
};

// Combiner les reducers
const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Créer le reducer persisté
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurer le store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});

// Créer le persistor
export const persistor = persistStore(store);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
