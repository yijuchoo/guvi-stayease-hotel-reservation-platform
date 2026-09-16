import {useState, useEffect} from 'react';
import {getManagerDashboard, type ManagerDashboard} from '../../api/dashboard';

function StatCard({label, value}: { label: string; value: string | number }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-teal-900">{value}</p>
        </div>
    );
}

function ManagerDashboardPage() {
    const [data, setData] = useState<ManagerDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getManagerDashboard().then((res) => setData(res.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;
    if (!data) return <div className="px-6 py-10 text-red-600">Could not load dashboard.</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-6">Manager Dashboard</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard label="My Hotels" value={data.totalHotels}/>
                    <StatCard label="Total Rooms" value={data.totalRooms}/>
                    <StatCard label="Total Bookings" value={data.totalBookings}/>
                    <StatCard label="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`}/>
                    <StatCard label="Average Rating"
                              value={data.averageRating > 0 ? `★ ${data.averageRating.toFixed(1)}` : 'No reviews yet'}/>
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboardPage;