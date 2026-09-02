package com.stayease.backend.dto;

public class ManagerDashboardResponse {

    private long totalHotels;
    private long totalRooms;
    private long totalBookings;
    private double totalRevenue;
    private double averageRating;

    public ManagerDashboardResponse() {
    }

    public ManagerDashboardResponse(long totalHotels, long totalRooms, long totalBookings,
                                    double totalRevenue, double averageRating) {
        this.totalHotels = totalHotels;
        this.totalRooms = totalRooms;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.averageRating = averageRating;
    }

    public long getTotalHotels() {
        return totalHotels;
    }

    public void setTotalHotels(long totalHotels) {
        this.totalHotels = totalHotels;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}
