import React from 'react';

interface PromotionBannerProps {
    text: string;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ text }) => {
    return (
        <div className="bg-gradient-to-r from-bronze-600 via-bronze-500 to-bronze-600 text-white py-2 px-4 text-center relative overflow-hidden shadow-lg z-50">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div className="relative flex items-center justify-center gap-2">
                <span className="animate-bounce">🔥</span>
                <p className="font-bold uppercase tracking-wider text-sm md:text-base drop-shadow-md">
                    {text}
                </p>
                <span className="animate-bounce">🔥</span>
            </div>
        </div>
    );
};

export default PromotionBanner;
