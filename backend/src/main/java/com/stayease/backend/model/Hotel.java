package com.stayease.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "hotels")
public class Hotel {

    @Id
    private String id;

    @Field("owner_id")
    private String ownerId; // references User.id of the Hotel Manager who owns this listing

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("address")
    private String address;

    @Field("city")
    private String city;

    @Field("country")
    private String country;

    @Field("amenities")
    private List<String> amenities; // e.g. ["WiFi", "Pool", "Parking", "Breakfast"]

    @Field("image_urls")
    private List<String> imageUrls;

    @Field("star_rating")
    private double starRating; // e.g. 4.5 out of 5, based on reviews later

    @Field("status")
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, PENDING_APPROVAL

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // ---------- Constructors ----------

    public Hotel() {
    }

    public Hotel(String ownerId, String name, String description, String address, String city,
                 String country, List<String> amenities, List<String> imageUrls,
                 double starRating, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
        this.address = address;
        this.city = city;
        this.country = country;
        this.amenities = amenities;
        this.imageUrls = imageUrls;
        this.starRating = starRating;
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

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
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

    public double getStarRating() {
        return starRating;
    }

    public void setStarRating(double starRating) {
        this.starRating = starRating;
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
        return "Hotel{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", city='" + city + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
