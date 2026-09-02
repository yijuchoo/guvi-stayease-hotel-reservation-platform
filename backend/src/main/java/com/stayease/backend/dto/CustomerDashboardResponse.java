package com.stayease.backend.dto;

public class CustomerDashboardResponse {

    private long totalBookings;
    private long upcomingBookings;
    private long pastBookings;
    private long cancelledBookings;
    private double totalSpent;

    public CustomerDashboardResponse() {
    }

    public CustomerDashboardResponse(long totalBookings, long upcomingBookings, long pastBookings,
                                     long cancelledBookings, double totalSpent) {
        this.totalBookings = totalBookings;
        this.upcomingBookings = upcomingBookings;
        this.pastBookings = pastBookings;
        this.cancelledBookings = cancelledBookings;
        this.totalSpent = totalSpent;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getUpcomingBookings() {
        return upcomingBookings;
    }

    public void setUpcomingBookings(long upcomingBookings) {
        this.upcomingBookings = upcomingBookings;
    }

    public long getPastBookings() {
        return pastBookings;
    }

    public void setPastBookings(long pastBookings) {
        this.pastBookings = pastBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }
}
