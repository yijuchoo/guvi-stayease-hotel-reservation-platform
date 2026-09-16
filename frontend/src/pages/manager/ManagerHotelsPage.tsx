import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {getMyHotels, createHotel, updateHotel} from '../../api/hotels';
import type {HotelWithStats} from '../../types';
import {extractErrorMessage} from '../../utils/errorHelpers';

function ManagerHotelsPage() {
    const [hotels, setHotels] = useState<HotelWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHotel, setEditingHotel] = useState<HotelWithStats | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [amenities, setAmenities] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const fetchHotels = () => {
        setLoading(true);
        getMyHotels().then((res) => setHotels(res.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const resetForm = () => {
        setName('');
        setDescription('');
        setAddress('');
        setCity('');
        setCountry('');
        setAmenities('');
        setImageUrl('');
        setError('');
        setEditingHotel(null);
    };

    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (hotel: HotelWithStats) => {
        setEditingHotel(hotel);
        setName(hotel.name);
        setDescription(hotel.description);
        setAddress(hotel.address);
        setCity(hotel.city);
        setCountry(hotel.country);
        setAmenities(hotel.amenities.join(', '));
        setImageUrl(hotel.imageUrls[0] || '');
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        const payload = {
            name, description, address, city, country,
            amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
            imageUrls: imageUrl ? [imageUrl] : [],
        };
        try {
            if (editingHotel) {
                await updateHotel(editingHotel.id, payload);
            } else {
                await createHotel(payload);
            }
            resetForm();
            setShowForm(false);
            fetchHotels();
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not save hotel. Please check your details and try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-serif font-bold text-charcoal">My Hotels</h1>
                    <button
                        onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
                        className="cursor-pointer bg-coral text-white px-4 py-2 rounded font-medium hover:bg-coral/90 transition-colors"
                    >
                        {showForm ? 'Cancel' : '+ Add Hotel'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-3">
                        <h2 className="font-semibold text-charcoal">{editingHotel ? `Editing: ${editingHotel.name}` : 'New Hotel'}</h2>
                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Hotel name</label>
                            <input required value={name} onChange={(e) => setName(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded"/>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded" rows={2}/>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Address</label>
                            <input required value={address} onChange={(e) => setAddress(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded"/>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">City</label>
                                <input required value={city} onChange={(e) => setCity(e.target.value)}
                                       className="w-full px-3 py-2 border border-gray-300 rounded"/>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Country</label>
                                <input required value={country} onChange={(e) => setCountry(e.target.value)}
                                       className="w-full px-3 py-2 border border-gray-300 rounded"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amenities (comma separated)</label>
                            <input value={amenities} onChange={(e) => setAmenities(e.target.value)}
                                   placeholder="WiFi, Pool, Gym"
                                   className="w-full px-3 py-2 border border-gray-300 rounded"/>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Image URL (optional)</label>
                            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded"/>
                        </div>

                        <button type="submit" disabled={submitting}
                                className="cursor-pointer bg-teal-700 text-white px-4 py-2 rounded font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Saving...' : editingHotel ? 'Save Changes' : 'Create Hotel'}
                        </button>
                    </form>
                )}

                {hotels.length === 0 ? (
                    <p className="text-gray-500">You haven't listed any hotels yet.</p>
                ) : (
                    <div className="space-y-3">
                        {hotels.map((hotel) => (
                            <div key={hotel.id}
                                 className="bg-white rounded-lg shadow-sm p-5 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-charcoal">{hotel.name}</h3>
                                    <p className="text-sm text-gray-500">{hotel.city}, {hotel.country}</p>
                                    <div className="flex gap-3 mt-1 text-sm text-gray-500">
                                        <span>{hotel.totalRooms} room type{hotel.totalRooms !== 1 ? 's' : ''}</span>
                                        <span>·</span>
                                        <span>{hotel.totalBookings} booking{hotel.totalBookings !== 1 ? 's' : ''}</span>
                                        {hotel.starRating > 0 && (
                                            <>
                                                <span>·</span>
                                                <span className="text-teal-600">★ {hotel.starRating.toFixed(1)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditForm(hotel)}
                                            className="cursor-pointer text-sm text-teal-600 font-medium px-3 py-1.5 rounded hover:bg-sand">
                                        Edit
                                    </button>
                                    <Link to={`/manager/hotels/${hotel.id}/rooms`}
                                          className="cursor-pointer text-sm text-teal-600 font-medium px-3 py-1.5 rounded hover:bg-sand">
                                        Manage Rooms
                                    </Link>
                                    <Link to={`/manager/hotels/${hotel.id}/bookings`}
                                          className="cursor-pointer text-sm text-teal-600 font-medium px-3 py-1.5 rounded hover:bg-sand">
                                        View Bookings
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerHotelsPage;