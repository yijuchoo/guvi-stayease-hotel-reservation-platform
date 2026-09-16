package com.stayease.backend.controller;

import com.stayease.backend.dto.ReviewRequest;
import com.stayease.backend.dto.ReviewResponse;
import com.stayease.backend.model.Review;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.ReviewService;
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
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    @Autowired
    public ReviewController(ReviewService reviewService, CurrentUserService currentUserService) {
        this.reviewService = reviewService;
        this.currentUserService = currentUserService;
    }

    // Only customers can submit a review, tied to their own completed booking
    @Operation(summary = "Submit a review for a completed or confirmed booking (Customer only)")
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest request,
                                          Authentication authentication) {
        try {
            String customerId = currentUserService.getCurrentUserId(authentication);
            Review review = reviewService.createReview(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Public - anyone can read reviews for a hotel
    @Operation(summary = "View all reviews for a specific hotel")
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForHotel(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewService.getReviewsByHotel(hotelId));
    }
}
