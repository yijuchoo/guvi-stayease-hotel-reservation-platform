package com.stayease.backend.repository;

import com.stayease.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByCustomerId(String customerId);

    Optional<Payment> findByBookingId(String bookingId);
}
