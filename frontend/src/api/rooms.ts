import apiClient from './client';
import type { Room } from '../types';

// Room API calls

export const getRoomsByHotel = (hotelId: string) =>
    apiClient.get<Room[]>(`/api/hotels/${hotelId}/rooms`);

export const createRoom = (hotelId: string, payload: Omit<Room, 'id' | 'hotelId' | 'availableRooms' | 'status'>) =>
    apiClient.post<Room>(`/api/hotels/${hotelId}/rooms`, payload);

export const updateRoom = (roomId: string, payload: Omit<Room, 'id' | 'hotelId' | 'availableRooms' | 'status'>) =>
    apiClient.put<Room>(`/api/rooms/${roomId}`, payload);