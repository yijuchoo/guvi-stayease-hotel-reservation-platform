import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../api/users';
import { useAppDispatch } from '../app/hooks';
import { setFullName } from '../features/authSlice';
import { extractErrorMessage } from '../utils/errorHelpers';

function ProfilePage() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [email, setEmail] = useState('');
    const [fullName, setFullNameState] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const [createdAt, setCreatedAt] = useState('');

    useEffect(() => {
        getMyProfile()
            .then((res) => {
                setEmail(res.data.email);
                setFullNameState(res.data.fullName);
                setPhoneNumber(res.data.phoneNumber);
                setRoles(res.data.roles);
                setCreatedAt(res.data.createdAt);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setSaving(true);
        try {
            const res = await updateMyProfile({ fullName, phoneNumber });
            dispatch(setFullName(res.data.fullName));
            setSuccess(true);
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not update profile.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="px-6 py-10 text-charcoal">Loading...</div>;

    return (
        <div className="px-6 py-10">
            <div className="max-w-lg mx-auto">
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-6">My Profile</h1>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-charcoal">{email}</p>
                    </div>

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    {success && <p className="text-success text-sm mb-4">Profile updated successfully.</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-charcoal mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullNameState(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-charcoal mb-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer bg-teal-700 text-white px-5 py-2 rounded font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                        <p>Account type: {roles.join(', ').replace('_', ' ')}</p>
                        <p>Member since: {new Date(createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;