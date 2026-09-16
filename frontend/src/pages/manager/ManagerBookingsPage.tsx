import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {getBookingsForHotel} from '../../api/bookings';
import {getHotelById} from '../../api/hotels';
import type {BookingWithDetails} from '../../types';

function statusColor(status: string) {
    switch (status) {
        case 'CONFIRMED': return 'bg-success/15 text-success';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'CANCELLED': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function ManagerBookingsPage() {
    const {hotelId} = useParams<{ hotelId: string }>();
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [hotelName, setHotelName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hotelId) return;
        setLoading(true);
        Promise.all([getBookingsForHotel(hotelId), getHotelById(hotelId)])
            .then(([bookingsRes, hotelRes]) => {
                setBookings(bookingsRes.data);
                setHotelName(hotelRes.data.name);
            })
            .finally(() => setLoading(false));
    }, [hotelId]);

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <Link to="/manager/hotels" className="text-teal-600 text-sm font-medium">&larr; Back to my hotels</Link>

                <h1 className="text-3xl font-serif font-bold text-charcoal mt-4 mb-1">Bookings</h1>
                <p className="text-gray-500 mb-6">{hotelName}</p>

                {bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings yet for this hotel.</p>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-lg shadow-sm p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-charcoal">{booking.customerName}</h3>
                                        <p className="text-sm text-gray-500">{booking.roomType}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded font-medium ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                                </div>

                                <div className="text-sm text-gray-500 mb-1">
                                    <span className="text-gray-400">Check-in:</span> {booking.checkInDate}
                                    <span className="mx-2 text-gray-300">→</span>
                                    <span className="text-gray-400">Check-out:</span> {booking.checkOutDate}
                                </div>
                                <p className="text-sm text-gray-500 mb-3">
                                    {booking.numberOfGuests} guest(s), {booking.numberOfRooms} room(s)
                                </p>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="font-bold text-teal-900">${booking.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerBookingsPage;