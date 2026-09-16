import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-teal-900 text-sand/70 mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-white font-serif text-lg font-bold mb-2">StayEase</h3>
                    <p className="text-sm">Find your next stay, wherever you're headed. Booking made simple.</p>
                </div>
                <div>
                    <h4 className="text-white text-sm font-semibold mb-2">Explore</h4>
                    <ul className="text-sm space-y-1">
                        <li><Link to="/" className="hover:text-coral transition-colors">Search Hotels</Link></li>
                        <li><Link to="/register" className="hover:text-coral transition-colors">Become a Host</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white text-sm font-semibold mb-2">Support</h4>
                    <ul className="text-sm space-y-1">
                        <li>help@stayease.com</li>
                        <li>This is a student project demo — no real bookings or payments are processed.</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 py-4 text-center text-xs">
                © {new Date().getFullYear()} StayEase. Built as a hotel reservation platform demo.
            </div>
        </footer>
    );
}

export default Footer;