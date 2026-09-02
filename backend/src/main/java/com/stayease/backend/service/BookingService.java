package com.stayease.backend.service;

import com.stayease.backend.dto.BookingRequest;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Room;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomService roomService;
    private final HotelService hotelService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public BookingService(BookingRepository bookingRepository, RoomService roomService,
                          HotelService hotelService, NotificationService notificationService,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.roomService = roomService;
        this.hotelService = hotelService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public Booking createBooking(BookingRequest request, String customerId) {
        Room room = roomService.getRoomById(request.getRoomId()); // throws if room doesn't exist

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
                request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        // Check availability: how many rooms are already booked for the overlapping date range?
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate());

        int alreadyBooked = overlapping.stream().mapToInt(Booking::getNumberOfRooms).sum();
        int remainingAvailable = room.getTotalRooms() - alreadyBooked;

        if (request.getNumberOfRooms() > remainingAvailable) {
            throw new IllegalStateException(
                    "Not enough rooms available for the selected dates. Available: " + remainingAvailable);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        double totalPrice = room.getPricePerNight() * nights * request.getNumberOfRooms();

        Booking booking = new Booking();
        booking.setCustomerId(customerId);
        booking.setHotelId(room.getHotelId());
        booking.setRoomId(request.getRoomId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());
        booking.setNumberOfRooms(request.getNumberOfRooms());
        booking.setTotalPrice(totalPrice);
        booking.setStatus("PENDING"); // awaiting payment
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        User customer = userRepository.findById(customerId).orElse(null);
        if (customer != null) {
            Hotel hotel = hotelService.getHotelById(room.getHotelId());
            notificationService.sendEmail(
                    customer.getEmail(),
                    "Booking Received - StayEase",
                    "Hi " + customer.getFullName() + ",\n\n" +
                            "Your booking at " + hotel.getName() + " has been received and is pending payment.\n\n" +
                            "Check-in: " + savedBooking.getCheckInDate() + "\n" +
                            "Check-out: " + savedBooking.getCheckOutDate() + "\n" +
                            "Total: $" + savedBooking.getTotalPrice() + "\n\n" +
                            "Please complete payment to confirm your reservation.\n\nThe StayEase Team"
            );
            notificationService.sendSms(customer.getPhoneNumber());
        }

        return savedBooking;
    }

    public List<Booking> getBookingsByCustomer(String customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    // check that the requesting manager actually owns that specific hotel
    public List<Booking> getBookingsByHotelForOwner(String hotelId, String requestingUserId) {
        Hotel hotel = hotelService.getHotelById(hotelId); // throws if hotel doesn't exist

        if (!hotel.getOwnerId().equals(requestingUserId)) {
            throw new SecurityException("You do not have permission to view bookings for this hotel");
        }

        return bookingRepository.findByHotelId(hotelId);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
    }

    public Booking cancelBooking(String bookingId, String requestingUserId) {
        Booking booking = getBookingById(bookingId);

        if (!booking.getCustomerId().equals(requestingUserId)) {
            throw new SecurityException("You do not have permission to cancel this booking");
        }

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        Booking cancelledBooking = bookingRepository.save(booking);

        User customer = userRepository.findById(requestingUserId).orElse(null);
        if (customer != null) {
            Hotel hotel = hotelService.getHotelById(cancelledBooking.getHotelId());
            notificationService.sendEmail(
                    customer.getEmail(),
                    "Booking Cancelled - StayEase",
                    "Hi " + customer.getFullName() + ",\n\n" +
                            "Your booking at " + hotel.getName() + " has been cancelled as requested.\n\n" +
                            "Check-in: " + cancelledBooking.getCheckInDate() + "\n" +
                            "Check-out: " + cancelledBooking.getCheckOutDate() + "\n\n" +
                            "If you have any questions, please contact us.\n\nThe StayEase Team"
            );
        }

        return cancelledBooking;
    }

    public boolean isRoomAvailable(Room room, LocalDate checkIn, LocalDate checkOut, int guests, int roomsNeeded) {
        if (room.getMaxOccupancy() < guests) {
            return false;
        }
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(room.getId(), checkIn, checkOut);
        int alreadyBooked = overlapping.stream().mapToInt(Booking::getNumberOfRooms).sum();
        int remaining = room.getTotalRooms() - alreadyBooked;
        return remaining >= roomsNeeded;
    }

    public Booking confirmBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus("CONFIRMED");
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
}
