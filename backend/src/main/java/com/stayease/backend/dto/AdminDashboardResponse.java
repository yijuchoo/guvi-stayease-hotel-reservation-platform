package com.stayease.backend.dto;

import java.util.Map;

public class AdminDashboardResponse {

    private long totalUsers;
    private Map<String, Long> usersByRole;
    private long totalHotels;
    private long totalBookings;
    private double totalRevenue;
    private long totalReviews;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalUsers, Map<String, Long> usersByRole, long totalHotels,
                                  long totalBookings, double totalRevenue, long totalReviews) {
        this.totalUsers = totalUsers;
        this.usersByRole = usersByRole;
        this.totalHotels = totalHotels;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.totalReviews = totalReviews;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public long getTotalHotels() {
        return totalHotels;
    }

    public void setTotalHotels(long totalHotels) {
        this.totalHotels = totalHotels;
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

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }
}
