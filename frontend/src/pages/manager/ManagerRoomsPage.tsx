import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {getRoomsByHotel, createRoom, updateRoom} from '../../api/rooms';
import {getHotelById} from '../../api/hotels';
import type {Room} from '../../types';
import {extractErrorMessage} from '../../utils/errorHelpers';

function ManagerRoomsPage() {
    const {hotelId} = useParams<{ hotelId: string }>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [hotelName, setHotelName] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [roomType, setRoomType] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerNight, setPricePerNight] = useState(0);
    const [maxOccupancy, setMaxOccupancy] = useState(1);
    const [totalRooms, setTotalRooms] = useState(1);
    const [amenities, setAmenities] = useState('');

    const fetchRooms = () => {
        if (!hotelId) return;
        setLoading(true);
        getRoomsByHotel(hotelId).then((res) => setRooms(res.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!hotelId) return;
        fetchRooms();
        getHotelById(hotelId).then((res) => setHotelName(res.data.name));
    }, [hotelId]);

    const resetForm = () => {
        setRoomType('');
        setDescription('');
        setPricePerNight(0);
        setMaxOccupancy(1);
        setTotalRooms(1);
        setAmenities('');
        setError('');
        setEditingRoom(null);
    };

    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (room: Room) => {
        setEditingRoom(room);
        setRoomType(room.roomType);
        setDescription(room.description);
        setPricePerNight(room.pricePerNight);
        setMaxOccupancy(room.maxOccupancy);
        setTotalRooms(room.totalRooms);
        setAmenities(room.amenities.join(', '));
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotelId) return;
        setError('');
        setSubmitting(true);
        const payload = {
            roomType, description, pricePerNight, maxOccupancy, totalRooms,
            amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
            imageUrls: [],
        };
        try {
            if (editingRoom) {
                await updateRoom(editingRoom.id, payload);
            } else {
                await createRoom(hotelId, payload);
            }
            resetForm();
            setShowForm(false);
            fetchRooms();
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not save room. Please check your details.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <Link to="/manager/hotels" className="text-teal-600 text-sm font-medium">&larr; Back to my hotels</Link>

                <div className="flex justify-between items-center mt-4 mb-1">
                    <h1 className="text-3xl font-serif font-bold text-charcoal">Manage Rooms</h1>
                    <button
                        onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
                        className="cursor-pointer bg-coral text-white px-4 py-2 rounded font-medium hover:bg-coral/90 transition-colors"
                    >
                        {showForm ? 'Cancel' : '+ Add Room'}
                    </button>
                </div>
                <p className="text-gray-500 mb-6">{hotelName}</p>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-3">
                        <h2 className="font-semibold text-charcoal">{editingRoom ? `Editing: ${editingRoom.roomType}` : 'New Room'}</h2>
                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Room type</label>
                            <input required placeholder="e.g. Deluxe Double" value={roomType}
                                   onChange={(e) => setRoomType(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded"/>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded" rows={2}/>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Price / night</label>
                                <input required type="number" min={0} step={0.01} value={pricePerNight}
                                       onChange={(e) => setPricePerNight(Number(e.target.value))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded"/>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Max occupancy</label>
                                <input required type="number" min={1} value={maxOccupancy}
                                       onChange={(e) => setMaxOccupancy(Number(e.target.value))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded"/>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Total rooms</label>
                                <input required type="number" min={1} value={totalRooms}
                                       onChange={(e) => setTotalRooms(Number(e.target.value))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amenities (comma separated)</label>
                            <input placeholder="WiFi, AC, TV, Mini Bar" value={amenities}
                                   onChange={(e) => setAmenities(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded"/>
                        </div>

                        <button type="submit" disabled={submitting}
                                className="cursor-pointer bg-teal-700 text-white px-4 py-2 rounded font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
                        </button>
                    </form>
                )}

                {rooms.length === 0 ? (
                    <p className="text-gray-500">No rooms added yet.</p>
                ) : (
                    <div className="space-y-3">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white rounded-lg shadow-sm p-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-charcoal">{room.roomType}</h3>
                                        {room.description &&
                                            <p className="text-sm text-gray-500 mt-1">{room.description}</p>}
                                        <p className="text-sm text-gray-500 mt-1">Sleeps {room.maxOccupancy} · {room.totalRooms} rooms
                                            total</p>
                                        {room.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {room.amenities.map((a) => (
                                                    <span key={a}
                                                          className="text-xs bg-sand px-2 py-0.5 rounded text-charcoal">{a}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                                        <p className="text-lg font-bold text-teal-900">
                                            ${room.pricePerNight.toFixed(2)}<span
                                            className="text-xs text-gray-500">/night</span>
                                        </p>
                                        <button onClick={() => openEditForm(room)}
                                                className="cursor-pointer text-sm text-teal-600 font-medium px-3 py-1.5 rounded hover:bg-sand">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerRoomsPage;