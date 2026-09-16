import apiClient from './client';
import type {Hotel, HotelWithStats} from '../types';

// Hotel API calls

export interface HotelSearchParams {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    amenities?: string[];
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
    rooms?: number;
}

export const searchHotels = (params: HotelSearchParams) =>
    apiClient.get<Hotel[]>('/api/hotels/search', {params});

export const getHotelById = (id: string) =>
    apiClient.get<Hotel>(`/api/hotels/${id}`);

export const createHotel = (payload: Omit<Hotel, 'id' | 'ownerId' | 'starRating' | 'status' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Hotel>('/api/hotels', payload);

export const updateHotel = (id: string, payload: Omit<Hotel, 'id' | 'ownerId' | 'starRating' | 'status' | 'createdAt' | 'updatedAt'>) =>
    apiClient.put<Hotel>(`/api/hotels/${id}`, payload);

export const getMyHotels = () =>
    apiClient.get<HotelWithStats[]>('/api/hotels/my-hotels');