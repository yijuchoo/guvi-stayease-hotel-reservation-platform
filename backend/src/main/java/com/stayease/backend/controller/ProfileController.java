package com.stayease.backend.controller;

import com.stayease.backend.dto.UpdateProfileRequest;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class ProfileController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @Autowired
    public ProfileController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @Operation(summary = "View the currently authenticated user's profile")
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String userId = currentUserService.getCurrentUserId(authentication);
            return ResponseEntity.ok(userService.getProfile(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Update the currently authenticated user's name and phone number")
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                           Authentication authentication) {
        try {
            String userId = currentUserService.getCurrentUserId(authentication);
            return ResponseEntity.ok(userService.updateProfile(userId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
