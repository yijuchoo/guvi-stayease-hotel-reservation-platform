package com.stayease.backend.service;

import com.stayease.backend.dto.RoomRequest;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Room;
import com.stayease.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final HotelService hotelService;

    @Autowired
    public RoomService(RoomRepository roomRepository, HotelService hotelService) {
        this.roomRepository = roomRepository;
        this.hotelService = hotelService;
    }

    public Room createRoom(String hotelId, RoomRequest request, String requestingUserId) {
        Hotel hotel = hotelService.getHotelById(hotelId); // throws if hotel doesn't exist

        if (!hotel.getOwnerId().equals(requestingUserId)) {
            throw new SecurityException("You do not have permission to add rooms to this hotel");
        }

        Room room = new Room();
        room.setHotelId(hotelId);
        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setMaxOccupancy(request.getMaxOccupancy());
        room.setTotalRooms(request.getTotalRooms());
        room.setAvailableRooms(request.getTotalRooms()); // starts full, server-controlled
        room.setAmenities(request.getAmenities());
        room.setImageUrls(request.getImageUrls());
        room.setStatus("ACTIVE");
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());

        return roomRepository.save(room);
    }

    public List<Room> getRoomsByHotel(String hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    public Room getRoomById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + id));
    }

    public Room updateRoom(String roomId, RoomRequest request, String requestingUserId) {
        Room room = getRoomById(roomId);
        Hotel hotel = hotelService.getHotelById(room.getHotelId());

        if (!hotel.getOwnerId().equals(requestingUserId)) {
            throw new SecurityException("You do not have permission to edit this room");
        }

        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setMaxOccupancy(request.getMaxOccupancy());

        // If totalRooms increases, add the difference to availableRooms too;
        // if it decreases, we don't auto-reduce availableRooms below what's already booked out.
        int roomDifference = request.getTotalRooms() - room.getTotalRooms();
        room.setTotalRooms(request.getTotalRooms());
        room.setAvailableRooms(Math.max(0, room.getAvailableRooms() + roomDifference));

        room.setAmenities(request.getAmenities());
        room.setImageUrls(request.getImageUrls());
        room.setUpdatedAt(LocalDateTime.now());

        return roomRepository.save(room);
    }
}
