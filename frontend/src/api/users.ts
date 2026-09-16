import apiClient from './client';
import type {User} from '../types';

// profile API call

export const getMyProfile = () => apiClient.get<User>('/api/users/me');

export interface UpdateProfilePayload {
    fullName: string;
    phoneNumber: string;
}

export const updateMyProfile = (payload: UpdateProfilePayload) =>
    apiClient.put<User>('/api/users/me', payload);