import apiClient from './client';

export interface CustomerDashboard {
    totalBookings: number;
    upcomingBookings: number;
    pastBookings: number;
    cancelledBookings: number;
    totalSpent: number;
}

export const getCustomerDashboard = () =>
    apiClient.get<CustomerDashboard>('/api/dashboard/customer');

export interface ManagerDashboard {
    totalHotels: number;
    totalRooms: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
}

export const getManagerDashboard = () =>
    apiClient.get<ManagerDashboard>('/api/dashboard/manager');

export interface AdminDashboard {
    totalUsers: number;
    usersByRole: Record<string, number>;
    totalHotels: number;
    totalBookings: number;
    totalRevenue: number;
    totalReviews: number;
}

export const getAdminDashboard = () =>
    apiClient.get<AdminDashboard>('/api/dashboard/admin');