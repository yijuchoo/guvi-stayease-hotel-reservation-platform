package com.stayease.backend.service;

import com.stayease.backend.dto.*;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.security.CustomUserDetailsService;
import com.stayease.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final NotificationService notificationService;

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       CustomUserDetailsService userDetailsService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.notificationService = notificationService;
    }

    public User registerCustomer(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hash before saving
        user.setRoles(List.of(request.getRole())); // now comes from validated request field
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        notificationService.sendEmail(
                savedUser.getEmail(),
                "Welcome to StayEase!",
                "Hi " + savedUser.getFullName() + ",\n\nThank you for registering with StayEase. " +
                        "Your account has been created successfully.\n\nHappy travels!\nThe StayEase Team"
        );

        return savedUser;
    }

    public String login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        return jwtUtil.generateToken(userDetails);
    }

    // Password Recovery

    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        // Deliberately don't reveal whether the email exists - always respond the same way.
        // Only proceed with generating/sending a token if a matching user is actually found.
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = UUID.randomUUID().toString();

            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30)); // 30-minute validity window
            userRepository.save(user);

            notificationService.sendEmail(
                    user.getEmail(),
                    "Password Reset Request - StayEase",
                    "Hi " + user.getFullName() + ",\n\n" +
                            "We received a request to reset your password. Use the token below to reset it:\n\n" +
                            token + "\n\n" +
                            "This token will expire in 30 minutes. If you did not request this, please ignore this " +
                            "email.\n\n" +
                            "The StayEase Team"
            );
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null); // invalidate token after use, single-use only
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.sendEmail(
                user.getEmail(),
                "Password Changed - StayEase",
                "Hi " + user.getFullName() + ",\n\n" +
                        "Your password has been successfully changed. If you did not make this change, please contact" +
                        " us immediately.\n\n" +
                        "The StayEase Team"
        );
    }

    // Profile Management

    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserProfileResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getPhoneNumber(), user.getRoles(), user.getCreatedAt());
    }

    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        return new UserProfileResponse(savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(),
                savedUser.getPhoneNumber(), savedUser.getRoles(), savedUser.getCreatedAt());
    }
}
