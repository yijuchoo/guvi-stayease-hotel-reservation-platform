package com.stayease.backend.controller;

import com.stayease.backend.dto.PaymentRequest;
import com.stayease.backend.model.Payment;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentUserService currentUserService;

    @Autowired
    public PaymentController(PaymentService paymentService, CurrentUserService currentUserService) {
        this.paymentService = paymentService;
        this.currentUserService = currentUserService;
    }

    @Operation(summary = "Process a simulated payment for a pending booking")
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> processPayment(@Valid @RequestBody PaymentRequest request,
                                            Authentication authentication) {
        try {
            String customerId = currentUserService.getCurrentUserId(authentication);
            Payment payment = paymentService.processPayment(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "View the currently authenticated customer's payment history")
    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Payment>> getMyPayments(Authentication authentication) {
        String customerId = currentUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok(paymentService.getPaymentsByCustomer(customerId));
    }

    @Operation(summary = "View the payment record for a specific booking")
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getPaymentForBooking(@PathVariable String bookingId) {
        try {
            return ResponseEntity.ok(paymentService.getPaymentByBooking(bookingId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
