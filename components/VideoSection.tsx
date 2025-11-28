import React from 'react';

interface VideoSectionProps {
    videoUrl: string;
    title?: string;
    subtitle?: string;
    overlayOpacity?: number;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl, title, subtitle, overlayOpacity = 0.4 }) => {
    return (
        <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-garage-950 border-t border-garage-900">
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }}></div>
            </div>

            {(title || subtitle) && (
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    {title && (
                        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4 drop-shadow-lg">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-xl md:text-2xl text-garage-300 font-mono tracking-wide drop-shadow-md">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
        </section>
    );
};

export default VideoSection;
