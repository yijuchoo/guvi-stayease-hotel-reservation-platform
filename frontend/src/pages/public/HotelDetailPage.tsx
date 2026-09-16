import {useState, useEffect} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import {getHotelById} from '../../api/hotels';
import {getRoomsByHotel} from '../../api/rooms';
import {createBooking} from '../../api/bookings';
import {getReviewsByHotel} from '../../api/reviews';
import {useAppSelector} from '../../app/hooks';
import type {Hotel, Room, Review} from '../../types';
import {extractErrorMessage} from '../../utils/errorHelpers';
import ReviewCarousel from '../../components/ReviewCarousel';

function HotelDetailPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {token, roles} = useAppSelector((state) => state.auth);

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [numberOfRooms, setNumberOfRooms] = useState(1);
    const [bookingError, setBookingError] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        Promise.all([getHotelById(id), getRoomsByHotel(id), getReviewsByHotel(id)])
            .then(([hotelRes, roomsRes, reviewsRes]) => {
                setHotel(hotelRes.data);
                setRooms(roomsRes.data);
                setReviews(reviewsRes.data);
            })
            .catch(() => setError('Could not load hotel details.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBookNowClick = (room: Room) => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (!roles.includes('CUSTOMER')) {
            setBookingError('Only customer accounts can make bookings.');
            return;
        }
        setBookingRoom(room);
        setBookingError('');
    };

    const handleConfirmBooking = async () => {
        if (!bookingRoom) return;
        setBookingError('');
        setBookingLoading(true);
        try {
            const res = await createBooking({
                roomId: bookingRoom.id,
                checkInDate,
                checkOutDate,
                numberOfGuests,
                numberOfRooms,
            });
            navigate(`/payment/${res.data.id}`);
        } catch (err) {
            setBookingError(extractErrorMessage(err, 'Booking failed.'));
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-charcoal">Loading...</div>;
    if (error || !hotel) return <div className="p-10 text-red-600">{error || 'Hotel not found.'}</div>;

    return (
        <div>
            <div className="h-72 bg-teal-900">
                {hotel.imageUrls.length > 0 && (
                    <img src={hotel.imageUrls[0]} alt={hotel.name} className="w-full h-full object-cover"/>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <Link to="/" className="text-teal-600 text-sm font-medium">&larr; Back to search</Link>

                <div className="flex justify-between items-start mt-4 mb-2">
                    <h1 className="text-3xl font-serif font-bold text-charcoal">{hotel.name}</h1>
                    {hotel.starRating > 0 && (
                        <span className="text-teal-600 font-medium">
              ★ {hotel.starRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
                    )}
                </div>
                <p className="text-gray-500 mb-4">{hotel.address}, {hotel.city}, {hotel.country}</p>
                <p className="text-charcoal mb-6 max-w-2xl">{hotel.description}</p>

                <div className="flex flex-wrap gap-2 mb-10">
                    {hotel.amenities.map((amenity) => (
                        <span key={amenity}
                              className="text-sm bg-white px-3 py-1 rounded-full text-charcoal shadow-sm">{amenity}</span>
                    ))}
                </div>

                <h2 className="text-2xl font-serif font-semibold text-charcoal mb-4">Available Rooms</h2>

                {rooms.length === 0 ? (
                    <p className="text-gray-500 mb-10">No rooms listed for this hotel yet.</p>
                ) : (
                    <div className="space-y-4 mb-10">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white rounded-lg shadow-sm p-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-charcoal">{room.roomType}</h3>
                                        <p className="text-sm text-gray-500 mb-1">{room.description}</p>
                                        <p className="text-sm text-gray-500">Sleeps up to {room.maxOccupancy}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {room.amenities.map((a) => (
                                                <span key={a}
                                                      className="text-xs bg-sand px-2 py-0.5 rounded text-charcoal">{a}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-teal-900">${room.pricePerNight.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mb-3">per night</p>
                                        <button
                                            onClick={() => handleBookNowClick(room)}
                                            className="cursor-pointer bg-coral text-white px-4 py-2 rounded font-medium hover:bg-coral/90 transition-colors"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>

                                {bookingRoom?.id === room.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        {bookingError && <p className="text-red-600 text-sm mb-3">{bookingError}</p>}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Check-in</label>
                                                <input type="date" value={checkInDate}
                                                       onChange={(e) => setCheckInDate(e.target.value)}
                                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Check-out</label>
                                                <input type="date" value={checkOutDate}
                                                       onChange={(e) => setCheckOutDate(e.target.value)}
                                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Guests</label>
                                                <input type="number" min={1} value={numberOfGuests}
                                                       onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Rooms</label>
                                                <input type="number" min={1} value={numberOfRooms}
                                                       onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"/>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleConfirmBooking}
                                                disabled={bookingLoading || !checkInDate || !checkOutDate}
                                                className="bg-teal-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-teal-900/90 disabled:opacity-50"
                                            >
                                                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                                            </button>
                                            <button
                                                onClick={() => setBookingRoom(null)}
                                                className="px-4 py-2 rounded text-sm font-medium text-gray-500 hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <h2 className="text-2xl font-serif font-semibold text-charcoal mb-4">Guest Reviews</h2>

                {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet. Be the first to stay and share your experience!</p>
                ) : (
                    <ReviewCarousel reviews={reviews}/>
                )}
            </div>
        </div>
    );
}

export default HotelDetailPage;