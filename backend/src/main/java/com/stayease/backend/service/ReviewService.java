package com.stayease.backend.service;

import com.stayease.backend.dto.ReviewRequest;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Review;
import com.stayease.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingService bookingService;
    private final HotelService hotelService;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, BookingService bookingService, HotelService hotelService) {
        this.reviewRepository = reviewRepository;
        this.bookingService = bookingService;
        this.hotelService = hotelService;
    }

    public Review createReview(ReviewRequest request, String customerId) {
        Booking booking = bookingService.getBookingById(request.getBookingId());

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("You can only review your own bookings");
        }

        if (!"CONFIRMED".equals(booking.getStatus()) && !"COMPLETED".equals(booking.getStatus())) {
            throw new IllegalStateException("You can only review completed or confirmed stays");
        }

        if (reviewRepository.findByHotelIdAndCustomerId(booking.getHotelId(), customerId).isPresent()) {
            throw new IllegalStateException("You have already reviewed this hotel");
        }

        Review review = new Review();
        review.setHotelId(booking.getHotelId());
        review.setCustomerId(customerId);
        review.setBookingId(booking.getId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        updateHotelRating(booking.getHotelId());

        return saved;
    }

    public List<Review> getReviewsByHotel(String hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }

    private void updateHotelRating(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Hotel hotel = hotelService.getHotelById(hotelId);
        hotel.setStarRating(Math.round(average * 10.0) / 10.0); // round to 1 decimal place
        hotelService.saveHotel(hotel);
    }
}
