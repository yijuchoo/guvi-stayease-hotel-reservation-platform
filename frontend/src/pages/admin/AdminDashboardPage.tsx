import {useState, useEffect} from 'react';
import {getAdminDashboard, type AdminDashboard} from '../../api/dashboard';

function StatCard({label, value}: { label: string; value: string | number }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-teal-900">{value}</p>
        </div>
    );
}

function AdminDashboardPage() {
    const [data, setData] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminDashboard().then((res) => setData(res.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;
    if (!data) return <div className="px-6 py-10 text-red-600">Could not load dashboard.</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total Users" value={data.totalUsers}/>
                    <StatCard label="Total Hotels" value={data.totalHotels}/>
                    <StatCard label="Total Bookings" value={data.totalBookings}/>
                    <StatCard label="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`}/>
                    <StatCard label="Total Reviews" value={data.totalReviews}/>
                </div>

                <h2 className="text-xl font-serif font-semibold text-charcoal mb-3">Users by Role</h2>
                <div className="bg-white rounded-lg shadow-sm p-5 space-y-2">
                    {Object.entries(data.usersByRole).map(([role, count]) => (
                        <div key={role} className="flex justify-between text-sm">
                            <span className="text-charcoal">{role.replace('_', ' ')}</span>
                            <span className="font-semibold text-teal-900">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;