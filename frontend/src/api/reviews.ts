import apiClient from './client';
import type { Review } from '../types';

export interface CreateReviewPayload {
    bookingId: string;
    rating: number;
    comment: string;
}

export const createReview = (payload: CreateReviewPayload) =>
    apiClient.post<Review>('/api/reviews', payload);

export const getReviewsByHotel = (hotelId: string) =>
    apiClient.get<Review[]>(`/api/reviews/hotel/${hotelId}`);