import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { useAppDispatch } from '../../app/hooks';
import { setToken } from '../../features/authSlice';
import { extractErrorMessage } from '../../utils/errorHelpers';
import axios from 'axios';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSlowHint, setShowSlowHint] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (loading) {
            timer = setTimeout(() => setShowSlowHint(true), 4000);
        } else {
            setShowSlowHint(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginUser({ email, password });
            dispatch(setToken(res.data.token));
            navigate('/');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError('Invalid email or password.');
            } else {
                setError(extractErrorMessage(err, 'Something went wrong. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center px-6 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm">
                <h1 className="text-2xl font-serif font-bold text-charcoal mb-6 text-center">Welcome back</h1>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full bg-coral text-white py-2 rounded font-medium hover:bg-coral/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    {showSlowHint && (
                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                            This is taking a little longer than usual. Please stay on this page — we're almost there!
                        </p>
                    )}
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    <Link to="/forgot-password" className="text-teal-600 font-medium underline underline-offset-2 hover:text-teal-900">Forgot password?</Link>
                </div>
                <div className="mt-2 text-center text-sm text-gray-500">
                    No account? <Link to="/register" className="text-teal-600 font-medium underline underline-offset-2 hover:text-teal-900">Register</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;