package com.stayease.backend.repository;

import com.stayease.backend.model.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HotelRepository extends MongoRepository<Hotel, String> {
    List<Hotel> findByOwnerId(String ownerId);

    List<Hotel> findByCityIgnoreCase(String city);
}
