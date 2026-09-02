package com.stayease.backend.service;

import com.stayease.backend.dto.BookingRequest;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Room;
import com.stayease.backend.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomService roomService;

    @Mock
    private HotelService hotelService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.stayease.backend.repository.UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Room testRoom;
    private BookingRequest testRequest;

    @BeforeEach
    void setUp() {
        testRoom = new Room();
        testRoom.setId("room1");
        testRoom.setHotelId("hotel1");
        testRoom.setPricePerNight(100.0);
        testRoom.setTotalRooms(5);
        testRoom.setMaxOccupancy(2);

        testRequest = new BookingRequest();
        testRequest.setRoomId("room1");
        testRequest.setCheckInDate(LocalDate.now().plusDays(10));
        testRequest.setCheckOutDate(LocalDate.now().plusDays(15));
        testRequest.setNumberOfGuests(2);
        testRequest.setNumberOfRooms(1);
    }

    @Test
    void createBooking_shouldSucceed_whenRoomsAreAvailable() {
        when(roomService.getRoomById("room1")).thenReturn(testRoom);
        when(bookingRepository.findOverlappingBookings(anyString(), any(), any()))
                .thenReturn(Collections.emptyList()); // no existing bookings

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.createBooking(testRequest, "customer1");

        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        assertEquals(500.0, result.getTotalPrice()); // 100/night * 5 nights * 1 room
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldThrow_whenNotEnoughRoomsAvailable() {
        when(roomService.getRoomById("room1")).thenReturn(testRoom);

        // Simulate 5 rooms already booked (matches totalRooms, so 0 remain)
        Booking existingBooking = new Booking();
        existingBooking.setNumberOfRooms(5);
        when(bookingRepository.findOverlappingBookings(anyString(), any(), any()))
                .thenReturn(List.of(existingBooking));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> bookingService.createBooking(testRequest, "customer1"));

        assertTrue(exception.getMessage().contains("Not enough rooms available"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldThrow_whenCheckOutBeforeCheckIn() {
        testRequest.setCheckInDate(LocalDate.now().plusDays(10));
        testRequest.setCheckOutDate(LocalDate.now().plusDays(5)); // invalid: before check-in

        when(roomService.getRoomById("room1")).thenReturn(testRoom);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(testRequest, "customer1"));

        assertTrue(exception.getMessage().contains("Check-out date must be after check-in date"));
    }
}
