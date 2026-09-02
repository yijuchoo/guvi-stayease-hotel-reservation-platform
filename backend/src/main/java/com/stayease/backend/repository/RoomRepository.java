package com.stayease.backend.repository;

import com.stayease.backend.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String> {

    List<Room> findByHotelId(String hotelId);
    List<Room> findByHotelIdAndPricePerNightBetween(String hotelId, double minPrice, double maxPrice);
}
