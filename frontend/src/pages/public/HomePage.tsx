import { useState, useEffect } from 'react';
import { searchHotels } from '../../api/hotels';
import type { Hotel } from '../../types';
import HotelCard from '../../components/HotelCard';

const AMENITY_OPTIONS = ['WiFi', 'Pool', 'Gym', 'Breakfast', 'Spa', 'Parking', 'Air Conditioning', 'Beach Access'];

function HomePage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState('');
    const [rooms, setRooms] = useState('');

    const fetchHotels = (overrides?: Partial<{
        city: string; minPrice: string; maxPrice: string; minRating: string;
        amenities: string[]; checkInDate: string; checkOutDate: string; guests: string; rooms: string;
    }>) => {
        const params = {
            city: overrides?.city ?? city,
            minPrice: overrides?.minPrice ?? minPrice,
            maxPrice: overrides?.maxPrice ?? maxPrice,
            minRating: overrides?.minRating ?? minRating,
            amenities: overrides?.amenities ?? selectedAmenities,
            checkInDate: overrides?.checkInDate ?? checkInDate,
            checkOutDate: overrides?.checkOutDate ?? checkOutDate,
            guests: overrides?.guests ?? guests,
            rooms: overrides?.rooms ?? rooms,
        };

        setLoading(true);
        setError('');
        searchHotels({
            city: params.city || undefined,
            minPrice: params.minPrice ? Number(params.minPrice) : undefined,
            maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
            minRating: params.minRating ? Number(params.minRating) : undefined,
            amenities: params.amenities.length > 0 ? params.amenities : undefined,
            checkInDate: params.checkInDate || undefined,
            checkOutDate: params.checkOutDate || undefined,
            guests: params.guests ? Number(params.guests) : undefined,
            rooms: params.rooms ? Number(params.rooms) : undefined,
        })
            .then((res) => setHotels(res.data))
            .catch(() => setError('Could not load hotels. Please try again.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchHotels();
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
        );
    };

    const clearFilters = () => {
        setMinPrice(''); setMaxPrice(''); setMinRating(''); setSelectedAmenities([]);
        setCheckInDate(''); setCheckOutDate(''); setGuests(''); setRooms('');
        fetchHotels({
            city, minPrice: '', maxPrice: '', minRating: '', amenities: [],
            checkInDate: '', checkOutDate: '', guests: '', rooms: '',
        });
    };

    return (
        <div>
            <header className="bg-teal-900 text-white py-16 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl font-serif font-bold mb-3">StayEase</h1>
                    <p className="text-sand/80 mb-8">Find your next stay, wherever you're headed</p>

                    <form onSubmit={handleSearch} className="flex flex-col gap-2 max-w-xl mx-auto sm:flex-row sm:items-stretch">
                        <div className="flex-1 flex gap-2 min-w-0">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Where are you going?"
                                className="flex-1 min-w-0 h-12 px-4 rounded bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral"
                            />
                            <button
                                type="submit"
                                className="cursor-pointer h-12 px-6 bg-coral text-white rounded font-medium hover:bg-coral/90 transition-colors whitespace-nowrap"
                            >
                                Search
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters((v) => !v)}
                            className="cursor-pointer h-12 sm:w-36 sm:shrink-0 border border-white/60 text-white rounded font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                            {showFilters ? 'Hide filters' : 'Filters'}
                        </button>
                    </form>
                </div>
            </header>

            {showFilters && (
                <div className="bg-white border-b border-gray-200 px-6 py-6">
                    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Check-in</label>
                                <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Check-out</label>
                                <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Guests</label>
                                <input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)}
                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="1" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Rooms</label>
                                <input type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)}
                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Min price</label>
                                <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="$0" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Max price</label>
                                <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                                       className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="No limit" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Minimum rating</label>
                                <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                    <option value="">Any rating</option>
                                    {[4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}+ stars</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 mb-2">Amenities</label>
                            <div className="flex flex-wrap gap-2">
                                {AMENITY_OPTIONS.map((amenity) => (
                                    <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                                            selectedAmenities.includes(amenity)
                                                ? 'bg-teal-900 text-white border-teal-900'
                                                : 'bg-white text-charcoal border-gray-300 hover:border-teal-900'
                                        }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="cursor-pointer bg-coral text-white px-5 py-2 rounded font-medium hover:bg-coral/90 transition-colors">
                                Apply Filters
                            </button>
                            <button type="button" onClick={clearFilters} className="cursor-pointer px-5 py-2 rounded font-medium text-gray-500 hover:bg-gray-100">
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-6 py-10">
                {loading && <p className="text-charcoal">Loading hotels...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {!loading && !error && hotels.length === 0 && (
                    <p className="text-charcoal">No hotels found. Try adjusting your filters.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default HomePage;