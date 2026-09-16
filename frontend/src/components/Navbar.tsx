import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/authSlice';
import logoIcon from '../assets/icon.svg';

function Navbar() {
    const { email, roles, fullName } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        setMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => setMenuOpen(false);

    const primaryRole = roles[0];

    const navLinks = (
        <>
            {primaryRole === 'CUSTOMER' && (
                <>
                    <Link to="/my-bookings" onClick={closeMenu} className="hover:text-coral transition-colors">My Bookings</Link>
                    <Link to="/dashboard" onClick={closeMenu} className="hover:text-coral transition-colors">Dashboard</Link>
                </>
            )}
            {primaryRole === 'HOTEL_MANAGER' && (
                <>
                    <Link to="/manager/hotels" onClick={closeMenu} className="hover:text-coral transition-colors">My Hotels</Link>
                    <Link to="/manager/dashboard" onClick={closeMenu} className="hover:text-coral transition-colors">Dashboard</Link>
                </>
            )}
            {primaryRole === 'ADMIN' && (
                <Link to="/admin/dashboard" onClick={closeMenu} className="hover:text-coral transition-colors">Admin Dashboard</Link>
            )}
            <Link to="/profile" onClick={closeMenu} className="hover:text-coral transition-colors">{fullName || email}</Link>
        </>
    );

    return (
        <nav className="sticky top-0 z-50 bg-teal-900 text-white px-6 py-4">
            <div className="flex justify-between items-center">
                <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-xl font-serif font-bold">
                    <img src={logoIcon} alt="StayEase" className="w-8 h-8" />
                    StayEase
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                    {email ? (
                        <>
                            {navLinks}
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer bg-coral px-3 py-1.5 rounded hover:bg-coral/90 transition-colors"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-coral transition-colors">Log In</Link>
                            <Link to="/register" className="cursor-pointer bg-coral px-3 py-1.5 rounded hover:bg-coral/90 transition-colors">
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger button */}
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle menu"
                    className="md:hidden cursor-pointer w-8 h-8 flex flex-col justify-center items-center gap-1.5"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="md:hidden flex flex-col gap-3 mt-4 pt-4 border-t border-white/20 text-sm">
                    {email ? (
                        <>
                            {navLinks}
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer bg-coral px-3 py-2 rounded hover:bg-coral/90 transition-colors text-left w-fit"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu} className="hover:text-coral transition-colors">Log In</Link>
                            <Link to="/register" onClick={closeMenu} className="cursor-pointer bg-coral px-3 py-2 rounded hover:bg-coral/90 transition-colors w-fit">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;