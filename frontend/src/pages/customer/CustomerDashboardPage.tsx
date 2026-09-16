import {useState, useEffect} from 'react';
import {getCustomerDashboard, type CustomerDashboard} from '../../api/dashboard';

function StatCard({label, value}: { label: string; value: string | number }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-teal-900">{value}</p>
        </div>
    );
}

function CustomerDashboardPage() {
    const [data, setData] = useState<CustomerDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomerDashboard().then((res) => setData(res.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-sand p-10 text-charcoal">Loading...</div>;
    if (!data) return <div className="min-h-screen bg-sand p-10 text-red-600">Could not load dashboard.</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-6">My Dashboard</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Bookings" value={data.totalBookings}/>
                    <StatCard label="Upcoming" value={data.upcomingBookings}/>
                    <StatCard label="Past Stays" value={data.pastBookings}/>
                    <StatCard label="Cancelled" value={data.cancelledBookings}/>
                    <StatCard label="Total Spent" value={`$${data.totalSpent.toFixed(2)}`}/>
                </div>
            </div>
        </div>
    );
}

export default CustomerDashboardPage;