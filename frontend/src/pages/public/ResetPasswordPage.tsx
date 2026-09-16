import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { extractErrorMessage } from '../../utils/errorHelpers';

function ResetPasswordPage() {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not reset password. Please check your code and try again.'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center px-6 py-16">
                <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm text-center">
                    <div className="text-4xl mb-4">✓</div>
                    <h1 className="text-xl font-serif font-bold text-charcoal mb-2">Password reset</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Your password has been changed successfully. You can now log in with your new password.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="cursor-pointer bg-coral text-white px-5 py-2 rounded font-medium hover:bg-coral/90 transition-colors"
                    >
                        Go to Log In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-6 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm">
                <h1 className="text-2xl font-serif font-bold text-charcoal mb-2 text-center">Reset password</h1>
                <p className="text-gray-500 text-sm mb-6 text-center">
                    Paste the reset code from your email and choose a new password.
                </p>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Reset code</label>
                        <input
                            type="text"
                            required
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">New password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-charcoal mb-1">Confirm new password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full bg-teal-700 text-white py-2 rounded font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;