import apiClient from './client';
import type {Booking, BookingWithDetails} from '../types';

// Booking API calls

export interface CreateBookingPayload {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfRooms: number;
}

export const createBooking = (payload: CreateBookingPayload) =>
    apiClient.post<Booking>('/api/bookings', payload);

export const getMyBookings = () =>
    apiClient.get<Booking[]>('/api/bookings/my-bookings');

export const cancelBooking = (id: string) =>
    apiClient.put<Booking>(`/api/bookings/${id}/cancel`);

export const getBookingsForHotel = (hotelId: string) =>
    apiClient.get<BookingWithDetails[]>(`/api/bookings/hotel/${hotelId}`);