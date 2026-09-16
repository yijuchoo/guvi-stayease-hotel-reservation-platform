import { useState, useEffect } from 'react';

function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 bg-teal-800 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer"
        >
            ↑
        </button>
    );
}

export default BackToTop;