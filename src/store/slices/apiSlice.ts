import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types/auth.types';

// URL de base de l'API backend
const API_BASE_URL = 'https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Récupérer le token du state Redux
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Parcours', 'POI', 'Quiz', 'Challenge', 'Reward'],
  endpoints: builder => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // User endpoints
    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: data => ({
        url: '/users/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = apiSlice;
