package com.stayease.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    @Field("hotel_id")
    private String hotelId; // references Hotel.id

    @Field("room_type")
    private String roomType; // e.g. "Deluxe Double", "Standard Single", "Suite"

    @Field("description")
    private String description;

    @Field("price_per_night")
    private double pricePerNight;

    @Field("max_occupancy")
    private int maxOccupancy; // how many guests this room type sleeps

    @Field("total_rooms")
    private int totalRooms; // total inventory of this room type at this hotel

    @Field("available_rooms")
    private int availableRooms; // decremented as bookings are made

    @Field("amenities")
    private List<String> amenities; // e.g. ["AC", "TV", "Mini Bar", "Balcony"]

    @Field("image_urls")
    private List<String> imageUrls;

    @Field("status")
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // ---------- Constructors ----------

    public Room() {
    }

    public Room(String hotelId, String roomType, String description, double pricePerNight,
                int maxOccupancy, int totalRooms, int availableRooms, List<String> amenities,
                List<String> imageUrls, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.hotelId = hotelId;
        this.roomType = roomType;
        this.description = description;
        this.pricePerNight = pricePerNight;
        this.maxOccupancy = maxOccupancy;
        this.totalRooms = totalRooms;
        this.availableRooms = availableRooms;
        this.amenities = amenities;
        this.imageUrls = imageUrls;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ---------- Getters and Setters ----------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHotelId() {
        return hotelId;
    }

    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public int getMaxOccupancy() {
        return maxOccupancy;
    }

    public void setMaxOccupancy(int maxOccupancy) {
        this.maxOccupancy = maxOccupancy;
    }

    public int getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(int totalRooms) {
        this.totalRooms = totalRooms;
    }

    public int getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(int availableRooms) {
        this.availableRooms = availableRooms;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Room{" +
                "id='" + id + '\'' +
                ", hotelId='" + hotelId + '\'' +
                ", roomType='" + roomType + '\'' +
                ", pricePerNight=" + pricePerNight +
                ", availableRooms=" + availableRooms +
                '}';
    }
}
