package com.stayease.backend.dto;

import com.stayease.backend.model.Hotel;

import java.util.List;

public class HotelWithStatsResponse {

    private String id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private List<String> amenities;
    private List<String> imageUrls;
    private double starRating;
    private String status;
    private int totalRooms;
    private int totalBookings;

    public HotelWithStatsResponse(Hotel hotel, int totalRooms, int totalBookings) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.description = hotel.getDescription();
        this.address = hotel.getAddress();
        this.city = hotel.getCity();
        this.country = hotel.getCountry();
        this.amenities = hotel.getAmenities();
        this.imageUrls = hotel.getImageUrls();
        this.starRating = hotel.getStarRating();
        this.status = hotel.getStatus();
        this.totalRooms = totalRooms;
        this.totalBookings = totalBookings;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public double getStarRating() {
        return starRating;
    }

    public String getStatus() {
        return status;
    }

    public int getTotalRooms() {
        return totalRooms;
    }

    public int getTotalBookings() {
        return totalBookings;
    }
}
