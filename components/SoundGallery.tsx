import React, { useState, useRef } from 'react';

interface SoundSample {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    image?: string;
}

const SOUND_SAMPLES: SoundSample[] = [
    {
        id: 'stock-exhaust',
        title: 'Stock Exhaust',
        description: 'Standard factory exhaust note. Quiet and compliant.',
        audioUrl: '/motorcycle-rev.mp3', // Placeholder
    },
    {
        id: 'stage-1',
        title: 'Stage 1 Upgrade',
        description: 'Enhanced flow with a deeper, throatier rumble.',
        audioUrl: '/motorcycle-rev.mp3', // Placeholder
    },
    {
        id: 'race-exhaust',
        title: 'Full Race System',
        description: 'Unrestricted airflow. Aggressive, loud, and raw.',
        audioUrl: '/motorcycle-rev.mp3', // Placeholder
    }
];

const SoundGallery: React.FC = () => {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlay = (sample: SoundSample) => {
        if (playingId === sample.id) {
            // Pause if currently playing this one
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            // Play new one
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(sample.audioUrl);
            audio.volume = 0.6;
            audio.onended = () => setPlayingId(null);
            audio.play().catch(e => console.error("Audio play failed", e));
            audioRef.current = audio;
            setPlayingId(sample.id);
        }
    };

    return (
        <section className="py-24 bg-garage-950 border-t border-garage-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-4">Sound Check</h2>
                    <div className="h-1 w-20 bg-bronze-500 mx-auto"></div>
                    <p className="mt-4 text-garage-400 max-w-2xl mx-auto">
                        Hear the difference. Compare stock vs. custom exhaust setups.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {SOUND_SAMPLES.map((sample) => (
                        <div
                            key={sample.id}
                            className={`bg-garage-900 border ${playingId === sample.id ? 'border-bronze-500' : 'border-garage-800'} rounded-xl p-8 transition-all duration-300 hover:border-bronze-500/50 group`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-garage-950 rounded-full border border-garage-800 group-hover:border-bronze-500/30 transition-colors">
                                    <svg className={`w-8 h-8 ${playingId === sample.id ? 'text-bronze-500 animate-pulse' : 'text-garage-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </div>
                                {playingId === sample.id && (
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-4 bg-bronze-500 animate-[bounce_1s_infinite]"></div>
                                        <div className="w-1 h-6 bg-bronze-500 animate-[bounce_1.2s_infinite]"></div>
                                        <div className="w-1 h-3 bg-bronze-500 animate-[bounce_0.8s_infinite]"></div>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{sample.title}</h3>
                            <p className="text-garage-400 text-sm mb-8 min-h-[40px]">{sample.description}</p>

                            <button
                                onClick={() => handlePlay(sample)}
                                className={`w-full py-3 px-4 rounded-sm font-bold uppercase tracking-wider text-sm transition-all duration-300 ${playingId === sample.id
                                        ? 'bg-bronze-600 text-white shadow-[0_0_15px_rgba(205,127,50,0.4)]'
                                        : 'bg-garage-800 text-garage-300 hover:bg-garage-700 hover:text-white'
                                    }`}
                            >
                                {playingId === sample.id ? 'Stop Audio' : 'Play Sound'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SoundGallery;
