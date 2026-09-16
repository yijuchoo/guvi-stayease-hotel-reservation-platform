import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { extractErrorMessage } from '../../utils/errorHelpers';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch (err) {
            setError(extractErrorMessage(err, 'Something went wrong. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center px-6 py-16">
                <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm text-center">
                    <div className="text-4xl mb-4">✉️</div>
                    <h1 className="text-xl font-serif font-bold text-charcoal mb-2">Check your email</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        If an account with that email exists, we've sent a password reset code to it.
                    </p>
                    <Link to="/reset-password" className="text-teal-600 font-medium underline underline-offset-2 hover:text-teal-900">
                        I have my reset code
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-6 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm">
                <h1 className="text-2xl font-serif font-bold text-charcoal mb-2 text-center">Forgot password?</h1>
                <p className="text-gray-500 text-sm mb-6 text-center">
                    Enter your email and we'll send you a reset code.
                </p>

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
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full bg-teal-700 text-white py-2 rounded font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    <Link to="/login" className="text-teal-600 font-medium underline underline-offset-2 hover:text-teal-900">
                        Back to log in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;