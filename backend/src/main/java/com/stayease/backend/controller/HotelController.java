package com.stayease.backend.controller;

import com.stayease.backend.dto.HotelRequest;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.HotelSearchService;
import com.stayease.backend.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {
    private final HotelService hotelService;
    private final CurrentUserService currentUserService;
    private final HotelSearchService hotelSearchService;

    @Autowired
    public HotelController(HotelService hotelService, CurrentUserService currentUserService, HotelSearchService hotelSearchService) {
        this.hotelService = hotelService;
        this.currentUserService = currentUserService;
        this.hotelSearchService = hotelSearchService;
    }

    // Public - anyone can browse hotels, no login required
    @Operation(summary = "Browse all active hotels")
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    // Public - view single hotel details
    @Operation(summary = "View details of a specific hotel")
    @GetMapping("/{id}")
    public ResponseEntity<?> getHotelById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(hotelService.getHotelById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Restricted - only Hotel Managers can create listings
    @Operation(summary = "Create a new hotel listing (Hotel Manager only)")
    @PostMapping
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<Hotel> createHotel(@Valid @RequestBody HotelRequest request,
                                             Authentication authentication) {
        String ownerId = currentUserService.getCurrentUserId(authentication);
        Hotel hotel = hotelService.createHotel(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(hotel);
    }

    // Restricted - only the owning Hotel Manager can update their listing
    @Operation(summary = "Update a hotel listing (owning Hotel Manager only)")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<?> updateHotel(@PathVariable String id,
                                         @Valid @RequestBody HotelRequest request,
                                         Authentication authentication) {
        try {
            String requestingUserId = currentUserService.getCurrentUserId(authentication);
            Hotel updated = hotelService.updateHotel(id, request, requestingUserId);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Restricted - a Hotel Manager viewing their own properties
    @Operation(summary = "View all hotels owned by the currently authenticated Hotel Manager")
    @GetMapping("/my-hotels")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<List<Hotel>> getMyHotels(Authentication authentication) {
        String ownerId = currentUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok(hotelService.getHotelsByOwner(ownerId));
    }

    @Operation(summary = "Search hotels by city, price, rating, amenities, and date availability")
    @GetMapping("/search")
    public ResponseEntity<List<Hotel>> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) Integer rooms) {

        List<Hotel> results = hotelSearchService.searchHotels(
                city, minRating, amenities, minPrice, maxPrice, checkInDate, checkOutDate, guests, rooms);
        return ResponseEntity.ok(results);
    }
}
