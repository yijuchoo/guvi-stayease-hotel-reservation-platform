package com.stayease.backend.controller;

import com.stayease.backend.dto.BookingRequest;
import com.stayease.backend.dto.BookingWithDetailsResponse;
import com.stayease.backend.model.Booking;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    @Autowired
    public BookingController(BookingService bookingService, CurrentUserService currentUserService) {
        this.bookingService = bookingService;
        this.currentUserService = currentUserService;
    }

    // Any authenticated Customer can create a booking
    @Operation(summary = "Create a new booking for a room (Customer only)")
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request,
                                           Authentication authentication) {
        try {
            String customerId = currentUserService.getCurrentUserId(authentication);
            Booking booking = bookingService.createBooking(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Customer views their own booking history
    @Operation(summary = "View the currently authenticated customer's booking history")
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        String customerId = currentUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(customerId));
    }

    // Hotel Manager views bookings for their OWN hotel only (ownership-checked)
    @Operation(summary = "View all bookings for a hotel (owning Hotel Manager only)")
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<?> getBookingsForHotel(@PathVariable String hotelId, Authentication authentication) {
        try {
            String userId = currentUserService.getCurrentUserId(authentication);
            List<BookingWithDetailsResponse> bookings = bookingService.getBookingsByHotelForOwner(hotelId, userId);
            return ResponseEntity.ok(bookings);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Customer cancels their own booking
    @Operation(summary = "Cancel a booking (owning customer only)")
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, Authentication authentication) {
        try {
            String customerId = currentUserService.getCurrentUserId(authentication);
            Booking cancelled = bookingService.cancelBooking(id, customerId);
            return ResponseEntity.ok(cancelled);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
