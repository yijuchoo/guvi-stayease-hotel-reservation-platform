package com.stayease.backend.repository;

import com.stayease.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByHotelId(String hotelId);

    Optional<Review> findByHotelIdAndCustomerId(String hotelId, String customerId);
}
