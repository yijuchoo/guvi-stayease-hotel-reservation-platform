package com.stayease.backend.dto;

import com.stayease.backend.model.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingWithDetailsResponse {

    private String id;
    private String customerName;
    private String roomType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private int numberOfGuests;
    private int numberOfRooms;
    private double totalPrice;
    private String status;
    private LocalDateTime createdAt;

    public BookingWithDetailsResponse(Booking booking, String customerName, String roomType) {
        this.id = booking.getId();
        this.customerName = customerName;
        this.roomType = roomType;
        this.checkInDate = booking.getCheckInDate();
        this.checkOutDate = booking.getCheckOutDate();
        this.numberOfGuests = booking.getNumberOfGuests();
        this.numberOfRooms = booking.getNumberOfRooms();
        this.totalPrice = booking.getTotalPrice();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }

    public String getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getRoomType() {
        return roomType;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public int getNumberOfGuests() {
        return numberOfGuests;
    }

    public int getNumberOfRooms() {
        return numberOfRooms;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
