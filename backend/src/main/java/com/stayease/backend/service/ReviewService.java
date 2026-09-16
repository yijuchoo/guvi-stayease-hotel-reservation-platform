package com.stayease.backend.service;

import com.stayease.backend.dto.ReviewRequest;
import com.stayease.backend.dto.ReviewResponse;
import com.stayease.backend.model.*;
import com.stayease.backend.repository.ReviewRepository;
import com.stayease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingService bookingService;
    private final HotelService hotelService;
    private final RoomService roomService;
    private final UserRepository userRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, BookingService bookingService, HotelService hotelService,
                         RoomService roomService, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingService = bookingService;
        this.hotelService = hotelService;
        this.roomService = roomService;
        this.userRepository = userRepository;
    }

    public Review createReview(ReviewRequest request, String customerId) {
        Booking booking = bookingService.getBookingById(request.getBookingId());

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("You can only review your own bookings");
        }

        if (!"CONFIRMED".equals(booking.getStatus()) && !"COMPLETED".equals(booking.getStatus())) {
            throw new IllegalStateException("You can only review completed or confirmed stays");
        }

        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new IllegalStateException("You have already reviewed this booking");
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

    public List<ReviewResponse> getReviewsByHotel(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);

        return reviews.stream().map(review -> {
            String customerName = userRepository.findById(review.getCustomerId())
                    .map(User::getFullName)
                    .orElse("Anonymous Guest");

            String roomType = "Room";
            try {
                Booking booking = bookingService.getBookingById(review.getBookingId());
                Room room = roomService.getRoomById(booking.getRoomId());
                roomType = room.getRoomType();
            } catch (Exception ignored) {
                // booking or room may have been removed; fall back to generic label
            }

            return new ReviewResponse(
                    review.getId(), review.getHotelId(), review.getCustomerId(), customerName,
                    review.getBookingId(), roomType, review.getRating(), review.getComment(), review.getCreatedAt()
            );
        }).toList();
    }

    private void updateHotelRating(String hotelId) {
        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Hotel hotel = hotelService.getHotelById(hotelId);
        hotel.setStarRating(Math.round(average * 10.0) / 10.0);
        hotelService.saveHotel(hotel);
    }
}
