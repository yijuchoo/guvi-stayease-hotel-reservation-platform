// Auth API calls

import apiClient from './client';

export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role?: 'CUSTOMER' | 'HOTEL_MANAGER';
}

export interface LoginPayload {
    email: string;
    password: string;
}

export const registerUser = (payload: RegisterPayload) =>
    apiClient.post('/api/auth/register', payload);

export const loginUser = (payload: LoginPayload) =>
    apiClient.post<{ token: string }>('/api/auth/login', payload);

export const forgotPassword = (email: string) =>
    apiClient.post('/api/auth/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) =>
    apiClient.post('/api/auth/reset-password', { token, newPassword });