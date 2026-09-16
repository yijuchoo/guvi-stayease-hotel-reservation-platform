import type { Hotel } from '../types';
import { Link } from 'react-router-dom';

// A reusable HotelCard component

interface HotelCardProps {
    hotel: Hotel;
}

function HotelCard({ hotel }: HotelCardProps) {
    return (
        <Link
            to={`/hotels/${hotel.id}`}
            className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="h-48 bg-teal-100 flex items-center justify-center text-teal-700">
                {hotel.imageUrls.length > 0 ? (
                    <img src={hotel.imageUrls[0]} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm">No image available</span>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-serif font-semibold text-charcoal">{hotel.name}</h3>
                    {hotel.starRating > 0 && (
                        <span className="text-sm text-coral font-medium">★ {hotel.starRating.toFixed(1)}</span>
                    )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{hotel.city}, {hotel.country}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="text-xs bg-sand px-2 py-1 rounded text-charcoal">
              {amenity}
            </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

export default HotelCard;