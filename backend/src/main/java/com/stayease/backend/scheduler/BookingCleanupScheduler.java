package com.stayease.backend.scheduler;

import com.stayease.backend.model.Booking;
import com.stayease.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class BookingCleanupScheduler {

    private final BookingRepository bookingRepository;

    @Autowired
    public BookingCleanupScheduler(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // Runs once every hour
    @Scheduled(fixedRate = 3_600_000)
    public void cancelStaleUnpaidBookings() {
        List<Booking> pendingBookings = bookingRepository.findByStatus("PENDING");

        for (Booking booking : pendingBookings) {
            if (booking.getCheckInDate().isBefore(LocalDate.now())) {
                booking.setStatus("CANCELLED");
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);
            }
        }
    }
}
