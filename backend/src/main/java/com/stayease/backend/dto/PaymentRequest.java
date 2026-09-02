package com.stayease.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class PaymentRequest {

    @NotBlank(message = "Booking id is required")
    private String bookingId;

    @Pattern(regexp = "CARD|PAYPAL|BANK_TRANSFER", message = "Payment method must be CARD, PAYPAL, or BANK_TRANSFER")
    private String paymentMethod;

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}

/*Deliberately no card number, CVV, or any real payment details fields — since this is simulated, there's no reason
to even pretend to collect sensitive payment data, and it avoids any temptation to accidentally store something that
looks like real card info.*/