import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {processPayment} from '../../api/payments';
import {extractErrorMessage} from '../../utils/errorHelpers';

function PaymentPage() {
    const {bookingId} = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PAYPAL' | 'BANK_TRANSFER'>('CARD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handlePay = async () => {
        if (!bookingId) return;
        setError('');
        setLoading(true);
        try {
            await processPayment({bookingId, paymentMethod});
            setSuccess(true);
        } catch (err) {
            setError(extractErrorMessage(err, 'Payment failed.'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center px-6 py-16">
                <div className="bg-white rounded-lg shadow-sm p-8 max-w-sm text-center">
                    <div className="text-4xl mb-4">✓</div>
                    <h1 className="text-xl font-serif font-bold text-charcoal mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Your payment was successful and your booking is confirmed. A confirmation email is on its way.
                    </p>
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="bg-coral text-white px-5 py-2 rounded font-medium hover:bg-coral/90 transition-colors"
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-6 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm">
                <h1 className="text-xl font-serif font-bold text-charcoal mb-2 text-center">Complete Payment</h1>
                <p className="text-gray-500 text-sm mb-6 text-center">
                    This is a simulated payment for demo purposes — no real charge will be made.
                </p>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <label className="block text-sm text-charcoal mb-2">Payment Method</label>
                <div className="space-y-2 mb-6">
                    {(['CARD', 'PAYPAL', 'BANK_TRANSFER'] as const).map((method) => (
                        <label key={method} className="flex items-center gap-2 text-sm text-charcoal">
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={paymentMethod === method}
                                onChange={() => setPaymentMethod(method)}
                            />
                            {method.replace('_', ' ')}
                        </label>
                    ))}
                </div>

                <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full bg-coral text-white py-2 rounded font-medium hover:bg-coral/90 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;