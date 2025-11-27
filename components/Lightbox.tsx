import React, { useEffect } from 'react';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    image: string;
    title: string;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, image, title }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-garage-950/95 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-garage-400 hover:text-white transition-colors p-2 z-10"
            >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div
                className="relative max-w-7xl max-h-[90vh] w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={image}
                    alt={title}
                    className="max-w-full max-h-[85vh] object-contain shadow-2xl border border-garage-800 rounded-sm"
                />
                <h3 className="mt-4 text-xl font-bold text-white uppercase tracking-wider">{title}</h3>
            </div>
        </div>
    );
};

export default Lightbox;
