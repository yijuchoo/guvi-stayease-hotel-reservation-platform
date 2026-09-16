// TypeScript types matching your backend DTOs

export interface User {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    roles: string[];
    createdAt: string;
}

export interface Hotel {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    amenities: string[];
    imageUrls: string[];
    starRating: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Room {
    id: string;
    hotelId: string;
    roomType: string;
    description: string;
    pricePerNight: number;
    maxOccupancy: number;
    totalRooms: number;
    availableRooms: number;
    amenities: string[];
    imageUrls: string[];
    status: string;
}

export interface Booking {
    id: string;
    customerId: string;
    hotelId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfRooms: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    bookingId: string;
    customerId: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    status: string;
    createdAt: string;
}

export interface Review {
    id: string;
    hotelId: string;
    customerId: string;
    customerName: string;
    bookingId: string;
    roomType: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface HotelWithStats extends Hotel {
    totalRooms: number;
    totalBookings: number;
}

export interface BookingWithDetails {
    id: string;
    customerName: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfRooms: number;
    totalPrice: number;
    status: string;
    createdAt: string;
}