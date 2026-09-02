package com.stayease.backend.service;

import com.stayease.backend.dto.HotelRequest;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HotelService {
    private final HotelRepository hotelRepository;

    @Autowired
    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    public Hotel createHotel(HotelRequest request, String ownerId) {
        Hotel hotel = new Hotel();
        hotel.setOwnerId(ownerId);
        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setAmenities(request.getAmenities());
        hotel.setImageUrls(request.getImageUrls());
        hotel.setStatus("ACTIVE");
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());

        return hotelRepository.save(hotel);
    }

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public List<Hotel> getHotelsByOwner(String ownerId) {
        return hotelRepository.findByOwnerId(ownerId);
    }

    public Hotel getHotelById(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hotel not found with id: " + id));
    }

    public Hotel updateHotel(String id, HotelRequest request, String requestingUserId) {
        Hotel hotel = getHotelById(id);

        if (!hotel.getOwnerId().equals(requestingUserId)) {
            throw new SecurityException("You do not have permission to edit this hotel");
        }

        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setAmenities(request.getAmenities());
        hotel.setImageUrls(request.getImageUrls());
        hotel.setUpdatedAt(LocalDateTime.now());

        return hotelRepository.save(hotel);
    }

    public Hotel saveHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }
}
