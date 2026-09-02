package com.stayease.backend.service;

import com.stayease.backend.dto.AdminDashboardResponse;
import com.stayease.backend.dto.CustomerDashboardResponse;
import com.stayease.backend.dto.ManagerDashboardResponse;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Payment;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Autowired
    public DashboardService(BookingRepository bookingRepository, HotelRepository hotelRepository,
                            RoomRepository roomRepository, PaymentRepository paymentRepository,
                            ReviewRepository reviewRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public CustomerDashboardResponse getCustomerDashboard(String customerId) {
        List<Booking> bookings = bookingRepository.findByCustomerId(customerId);
        LocalDate today = LocalDate.now();

        long upcoming = bookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()) && b.getCheckInDate().isAfter(today))
                .count();
        long past = bookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()) && b.getCheckOutDate().isBefore(today))
                .count();
        long cancelled = bookings.stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()))
                .count();

        double totalSpent = paymentRepository.findByCustomerId(customerId).stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        return new CustomerDashboardResponse(bookings.size(), upcoming, past, cancelled, totalSpent);
    }

    public ManagerDashboardResponse getManagerDashboard(String ownerId) {
        List<Hotel> hotels = hotelRepository.findByOwnerId(ownerId);
        List<String> hotelIds = hotels.stream().map(Hotel::getId).toList();

        long totalRooms = hotelIds.stream()
                .mapToLong(hotelId -> roomRepository.findByHotelId(hotelId).size())
                .sum();

        List<Booking> allBookings = hotelIds.stream()
                .flatMap(hotelId -> bookingRepository.findByHotelId(hotelId).stream())
                .toList();

        double totalRevenue = allBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        double averageRating = hotels.stream()
                .mapToDouble(Hotel::getStarRating)
                .average()
                .orElse(0.0);

        return new ManagerDashboardResponse(hotels.size(), totalRooms, allBookings.size(),
                totalRevenue, Math.round(averageRating * 10.0) / 10.0);
    }

    public AdminDashboardResponse getAdminDashboard() {
        List<User> allUsers = userRepository.findAll();

        Map<String, Long> usersByRole = allUsers.stream()
                .flatMap(u -> u.getRoles().stream())
                .collect(Collectors.groupingBy(role -> role, Collectors.counting()));

        long totalHotels = hotelRepository.count();
        long totalBookings = bookingRepository.count();
        long totalReviews = reviewRepository.count();

        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        return new AdminDashboardResponse(allUsers.size(), usersByRole, totalHotels,
                totalBookings, totalRevenue, totalReviews);
    }
}
