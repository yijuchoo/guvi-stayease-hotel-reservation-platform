import apiClient from './client';
import type { Payment } from '../types';

// Payment API calls

export interface ProcessPaymentPayload {
    bookingId: string;
    paymentMethod: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER';
}

export const processPayment = (payload: ProcessPaymentPayload) =>
    apiClient.post<Payment>('/api/payments', payload);