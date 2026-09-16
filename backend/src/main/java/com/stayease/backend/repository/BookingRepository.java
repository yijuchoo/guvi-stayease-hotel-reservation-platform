package com.stayease.backend.repository;

import com.stayease.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByCustomerId(String customerId);

    List<Booking> findByHotelId(String hotelId);

    // Finds bookings for a room that OVERLAP with the given date range and are not cancelled.
    // Overlap logic: existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
    @Query("{ 'room_id': ?0, 'status': { $ne: 'CANCELLED' }, " +
            "'check_in_date': { $lt: ?2 }, 'check_out_date': { $gt: ?1 } }")
    List<Booking> findOverlappingBookings(String roomId, LocalDate checkInDate, LocalDate checkOutDate);

    List<Booking> findByStatus(String status);
}
