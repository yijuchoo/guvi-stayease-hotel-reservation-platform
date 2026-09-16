import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getMyBookings, cancelBooking} from '../../api/bookings';
import {createReview, getReviewsByHotel} from '../../api/reviews';
import {getHotelById} from '../../api/hotels';
import {getRoomsByHotel} from '../../api/rooms';
import type {Booking, Review} from '../../types';
import {extractErrorMessage} from '../../utils/errorHelpers';

function statusColor(status: string) {
    switch (status) {
        case 'CONFIRMED': return 'bg-success/15 text-success';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'CANCELLED': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
    }
}

interface EnrichedBooking extends Booking {
    hotelName?: string;
    roomType?: string;
}

function MyBookingsPage() {
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [myReviews, setMyReviews] = useState<Record<string, Review>>({});
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelError, setCancelError] = useState<Record<string, string>>({});
    const [payError, setPayError] = useState<Record<string, string>>({});
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');
    const navigate = useNavigate();

    const fetchBookings = async () => {
        setLoading(true);
        const res = await getMyBookings();
        const rawBookings = res.data;

        const enriched = await Promise.all(
            rawBookings.map(async (booking) => {
                try {
                    const [hotelRes, roomsRes] = await Promise.all([
                        getHotelById(booking.hotelId),
                        getRoomsByHotel(booking.hotelId),
                    ]);
                    const room = roomsRes.data.find((r) => r.id === booking.roomId);
                    return {...booking, hotelName: hotelRes.data.name, roomType: room?.roomType};
                } catch {
                    return {...booking, hotelName: 'Unknown hotel', roomType: undefined};
                }
            })
        );
        setBookings(enriched);

        const uniqueHotelIds = [...new Set(rawBookings.map((b) => b.hotelId))];
        const reviewsByBooking: Record<string, Review> = {};
        await Promise.all(
            uniqueHotelIds.map(async (hotelId) => {
                const reviewsRes = await getReviewsByHotel(hotelId);
                reviewsRes.data.forEach((review) => {
                    const matchingBooking = rawBookings.find((b) => b.id === review.bookingId);
                    if (matchingBooking) reviewsByBooking[matchingBooking.id] = review;
                });
            })
        );
        setMyReviews(reviewsByBooking);
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id: string) => {
        setCancellingId(id);
        setCancelError((prev) => ({...prev, [id]: ''}));
        try {
            await cancelBooking(id);
            fetchBookings();
        } catch (err) {
            setCancelError((prev) => ({...prev, [id]: extractErrorMessage(err, 'Could not cancel booking.')}));
        } finally {
            setCancellingId(null);
        }
    };

    const handlePayNowClick = (bookingId: string) => {
        setPayError((prev) => ({...prev, [bookingId]: ''}));
        navigate(`/payment/${bookingId}`);
    };

    const handleSubmitReview = async (bookingId: string) => {
        setReviewError('');
        try {
            await createReview({bookingId, rating, comment});
            setReviewingId(null);
            setComment('');
            fetchBookings();
        } catch (err) {
            setReviewError(extractErrorMessage(err, 'Could not submit review.'));
        }
    };

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-6">My Bookings</h1>

                {bookings.length === 0 ? (
                    <p className="text-gray-500">You haven't made any bookings yet.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const myReview = myReviews[booking.id];
                            const checkInPassed = new Date(booking.checkInDate) < new Date(new Date().toDateString());

                            return (
                                <div key={booking.id} className="bg-white rounded-lg shadow-sm p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-charcoal">{booking.hotelName}</h3>
                                            {booking.roomType &&
                                                <p className="text-sm text-gray-500">{booking.roomType}</p>}
                                            <p className="text-sm text-gray-500 mt-1">{booking.checkInDate} → {booking.checkOutDate}</p>
                                            <p className="text-sm text-gray-500">{booking.numberOfGuests} guest(s), {booking.numberOfRooms} room(s)</p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded font-medium ${statusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                                    </div>
                                    <p className="text-lg font-bold text-teal-900 mb-3">${booking.totalPrice.toFixed(2)}</p>

                                    {cancelError[booking.id] && (
                                        <p className="text-red-600 text-sm mb-2">{cancelError[booking.id]}</p>
                                    )}
                                    {payError[booking.id] && (
                                        <p className="text-red-600 text-sm mb-2">{payError[booking.id]}</p>
                                    )}

                                    <div className="flex gap-2">
                                        {booking.status === 'PENDING' && !checkInPassed && (
                                            <button onClick={() => handlePayNowClick(booking.id)}
                                                    className="bg-coral text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-coral/90">
                                                Pay Now
                                            </button>
                                        )}
                                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !checkInPassed && (
                                            <button onClick={() => handleCancel(booking.id)}
                                                    disabled={cancellingId === booking.id}
                                                    className="px-3 py-1.5 rounded text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                                                {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                        {booking.status === 'PENDING' && checkInPassed && (
                                            <span className="text-sm text-gray-400 italic">Check-in date has passed — this booking will be automatically cancelled</span>
                                        )}
                                        {booking.status === 'CONFIRMED' && !myReview && (
                                            <button onClick={() => setReviewingId(booking.id)}
                                                    className="px-3 py-1.5 rounded text-sm font-medium text-teal-900 hover:bg-sand">
                                                Leave a Review
                                            </button>
                                        )}
                                    </div>

                                    {reviewingId === booking.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            {reviewError && <p className="text-red-600 text-sm mb-2">{reviewError}</p>}
                                            <label className="block text-xs text-gray-500 mb-1">Rating</label>
                                            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
                                                    className="mb-2 px-2 py-1 border border-gray-300 rounded text-sm">
                                                {[5, 4, 3, 2, 1].map((n) => <option key={n}
                                                                                    value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="How was your stay?"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSubmitReview(booking.id)}
                                                        className="bg-teal-900 text-white px-3 py-1.5 rounded text-sm font-medium">
                                                    Submit Review
                                                </button>
                                                <button onClick={() => setReviewingId(null)}
                                                        className="px-3 py-1.5 rounded text-sm font-medium text-gray-500">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {myReview && (
                                        <div
                                            className="mt-4 pt-4 border-t border-gray-100 bg-sand/50 -mx-5 -mb-5 px-5 py-3 rounded-b-lg">
                                            <p className="text-xs text-gray-500 mb-1">Your review</p>
                                            <p className="text-sm text-coral font-medium mb-1">{'★'.repeat(myReview.rating)}{'☆'.repeat(5 - myReview.rating)}</p>
                                            {myReview.comment &&
                                                <p className="text-sm text-charcoal">{myReview.comment}</p>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyBookingsPage;