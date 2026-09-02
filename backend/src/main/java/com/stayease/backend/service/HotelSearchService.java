package com.stayease.backend.service;

import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Room;
import com.stayease.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HotelSearchService {

    private final MongoTemplate mongoTemplate;
    private final RoomRepository roomRepository;
    private final BookingService bookingService;

    @Autowired
    public HotelSearchService(MongoTemplate mongoTemplate, RoomRepository roomRepository,
                              BookingService bookingService) {
        this.mongoTemplate = mongoTemplate;
        this.roomRepository = roomRepository;
        this.bookingService = bookingService;
    }

    public List<Hotel> searchHotels(String city, Double minRating, List<String> amenities,
                                    Double minPrice, Double maxPrice,
                                    LocalDate checkInDate, LocalDate checkOutDate,
                                    Integer guests, Integer roomsNeeded) {

        // ---------- Step 1: base filter on Hotel fields ----------
        Criteria criteria = Criteria.where("status").is("ACTIVE");

        if (city != null && !city.isBlank()) {
            criteria = criteria.and("city").regex(city, "i"); // case-insensitive partial match
        }
        if (minRating != null) {
            criteria = criteria.and("star_rating").gte(minRating);
        }
        if (amenities != null && !amenities.isEmpty()) {
            criteria = criteria.and("amenities").all(amenities); // hotel must have ALL listed amenities
        }

        Query query = new Query(criteria);
        List<Hotel> candidates = mongoTemplate.find(query, Hotel.class);

        // ---------- Step 2: post-filter by price and/or date availability ----------
        boolean needsRoomFilter = (minPrice != null || maxPrice != null ||
                (checkInDate != null && checkOutDate != null));

        if (!needsRoomFilter) {
            return candidates;
        }

        double effectiveMinPrice = (minPrice != null) ? minPrice : 0;
        double effectiveMaxPrice = (maxPrice != null) ? maxPrice : Double.MAX_VALUE;
        int effectiveGuests = (guests != null) ? guests : 1;
        int effectiveRoomsNeeded = (roomsNeeded != null) ? roomsNeeded : 1;

        return candidates.stream()
                .filter(hotel -> hotelHasQualifyingRoom(
                        hotel, effectiveMinPrice, effectiveMaxPrice,
                        checkInDate, checkOutDate, effectiveGuests, effectiveRoomsNeeded))
                .toList();
    }

    private boolean hotelHasQualifyingRoom(Hotel hotel, double minPrice, double maxPrice,
                                           LocalDate checkInDate, LocalDate checkOutDate,
                                           int guests, int roomsNeeded) {

        List<Room> roomsInPriceRange = roomRepository.findByHotelIdAndPricePerNightBetween(
                hotel.getId(), minPrice, maxPrice);

        if (roomsInPriceRange.isEmpty()) {
            return false;
        }

        // If no dates given, price match alone is enough
        if (checkInDate == null || checkOutDate == null) {
            return true;
        }

        return roomsInPriceRange.stream()
                .anyMatch(room -> bookingService.isRoomAvailable(room, checkInDate, checkOutDate, guests, roomsNeeded));
    }
}
