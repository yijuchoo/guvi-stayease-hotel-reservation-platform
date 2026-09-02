package com.stayease.backend.service;

import com.stayease.backend.dto.PaymentRequest;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Payment;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.PaymentRepository;
import com.stayease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository, BookingService bookingService,
                          NotificationService notificationService, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public Payment processPayment(PaymentRequest request, String customerId) {
        Booking booking = bookingService.getBookingById(request.getBookingId());

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("You can only pay for your own bookings");
        }

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("This booking is not awaiting payment (current status: " + booking.getStatus() + ")");
        }

        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new IllegalStateException("A payment already exists for this booking");
        }

        // ---------- Simulated payment processing ----------
        // In a real integration, this is where you'd call Stripe/Razorpay/etc.
        // Here, we simulate a successful transaction every time.
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Payment payment = new Payment();
        payment.setBookingId(booking.getId());
        payment.setCustomerId(customerId);
        payment.setAmount(booking.getTotalPrice());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(transactionId);
        payment.setStatus("SUCCESS"); // simulated - always succeeds
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Payment succeeded -> confirm the booking
        bookingService.confirmBooking(booking.getId());

        User customer = userRepository.findById(customerId).orElse(null);
        if (customer != null) {
            notificationService.sendEmail(
                    customer.getEmail(),
                    "Payment Confirmed - StayEase",
                    "Hi " + customer.getFullName() + ",\n\n" +
                            "Your payment of $" + savedPayment.getAmount() + " was successful.\n" +
                            "Transaction ID: " + savedPayment.getTransactionId() + "\n\n" +
                            "Your booking is now confirmed. We look forward to hosting you!\n\nThe StayEase Team"
            );
        }

        return savedPayment;
    }

    public List<Payment> getPaymentsByCustomer(String customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }

    public Payment getPaymentByBooking(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("No payment found for booking id: " + bookingId));
    }
}
