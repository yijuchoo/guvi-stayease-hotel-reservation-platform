package com.stayease.backend.controller;

import com.stayease.backend.dto.RoomRequest;
import com.stayease.backend.model.Room;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.RoomService;
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
@RequestMapping("/api")
public class RoomController {

    private final RoomService roomService;
    private final CurrentUserService currentUserService;

    @Autowired
    public RoomController(RoomService roomService, CurrentUserService currentUserService) {
        this.roomService = roomService;
        this.currentUserService = currentUserService;
    }

    // Public - anyone can view rooms for a given hotel
    @Operation(summary = "View all rooms for a specific hotel")
    @GetMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<List<Room>> getRoomsByHotel(@PathVariable String hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotel(hotelId));
    }

    // Public - view a single room's details
    @Operation(summary = "View details of a specific room")
    @GetMapping("/rooms/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(roomService.getRoomById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Restricted - only the owning Hotel Manager can add rooms
    @Operation(summary = "Add a new room type to a hotel (owning Hotel Manager only)")
    @PostMapping("/hotels/{hotelId}/rooms")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<?> createRoom(@PathVariable String hotelId,
                                        @Valid @RequestBody RoomRequest request,
                                        Authentication authentication) {
        try {
            String userId = currentUserService.getCurrentUserId(authentication);
            Room room = roomService.createRoom(hotelId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(room);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Restricted - only the owning Hotel Manager can edit rooms
    @Operation(summary = "Update a room's details (owning Hotel Manager only)")
    @PutMapping("/rooms/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<?> updateRoom(@PathVariable String id,
                                        @Valid @RequestBody RoomRequest request,
                                        Authentication authentication) {
        try {
            String userId = currentUserService.getCurrentUserId(authentication);
            Room updated = roomService.updateRoom(id, request, userId);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
