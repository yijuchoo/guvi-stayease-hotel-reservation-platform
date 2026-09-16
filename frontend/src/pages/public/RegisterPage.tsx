import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {registerUser} from '../../api/auth';
import axios from 'axios';

function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'HOTEL_MANAGER'>('CUSTOMER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser({fullName, email, password, phoneNumber, role});
            navigate('/login');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                setError('An account with this email already exists.');
            } else if (axios.isAxiosError(err) && err.response?.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : 'Registration failed.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center px-6 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm">
                <h1 className="text-2xl font-serif font-bold text-charcoal mb-6 text-center">Create your account</h1>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Full Name</label>
                        <input
                            type="text" required value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Email</label>
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Password</label>
                        <input
                            type="password" required minLength={8} value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Phone Number</label>
                        <input
                            type="tel" required value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+6591234567"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'CUSTOMER' | 'HOTEL_MANAGER')}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        >
                            <option value="CUSTOMER">Traveler, looking to book stays</option>
                            <option value="HOTEL_MANAGER">Hotel Manager, listing properties</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full bg-coral text-white py-2 rounded font-medium hover:bg-coral/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-teal-600 font-medium">Log in</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;