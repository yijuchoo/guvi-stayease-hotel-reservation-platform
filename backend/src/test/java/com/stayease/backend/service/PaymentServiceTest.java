package com.stayease.backend.service;

import com.stayease.backend.dto.PaymentRequest;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Payment;
import com.stayease.backend.repository.PaymentRepository;
import com.stayease.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Booking pendingBooking;
    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        pendingBooking = new Booking();
        pendingBooking.setId("booking1");
        pendingBooking.setCustomerId("customer1");
        pendingBooking.setStatus("PENDING");
        pendingBooking.setTotalPrice(500.0);

        paymentRequest = new PaymentRequest();
        paymentRequest.setBookingId("booking1");
        paymentRequest.setPaymentMethod("CARD");
    }

    @Test
    void processPayment_shouldSucceed_whenBookingIsPendingAndUnpaid() {
        when(bookingService.getBookingById("booking1")).thenReturn(pendingBooking);
        when(paymentRepository.findByBookingId("booking1")).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("customer1")).thenReturn(Optional.empty()); // notification skipped, that's fine here

        Payment result = paymentService.processPayment(paymentRequest, "customer1");

        assertNotNull(result);
        assertEquals("SUCCESS", result.getStatus());
        assertEquals(500.0, result.getAmount());
        assertNotNull(result.getTransactionId());
        verify(bookingService, times(1)).confirmBooking("booking1");
    }

    @Test
    void processPayment_shouldThrow_whenBookingDoesNotBelongToCustomer() {
        when(bookingService.getBookingById("booking1")).thenReturn(pendingBooking);

        SecurityException exception = assertThrows(SecurityException.class,
                () -> paymentService.processPayment(paymentRequest, "someone_else"));

        assertTrue(exception.getMessage().contains("your own bookings"));
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(bookingService, never()).confirmBooking(anyString());
    }

    @Test
    void processPayment_shouldThrow_whenBookingAlreadyConfirmed() {
        pendingBooking.setStatus("CONFIRMED"); // no longer awaiting payment

        when(bookingService.getBookingById("booking1")).thenReturn(pendingBooking);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> paymentService.processPayment(paymentRequest, "customer1"));

        assertTrue(exception.getMessage().contains("not awaiting payment"));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void processPayment_shouldThrow_whenPaymentAlreadyExistsForBooking() {
        Payment existingPayment = new Payment();
        existingPayment.setId("payment1");

        when(bookingService.getBookingById("booking1")).thenReturn(pendingBooking);
        when(paymentRepository.findByBookingId("booking1")).thenReturn(Optional.of(existingPayment));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> paymentService.processPayment(paymentRequest, "customer1"));

        assertTrue(exception.getMessage().contains("already exists"));
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
