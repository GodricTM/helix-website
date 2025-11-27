import React from 'react';

const DNAHelix: React.FC = () => {
  // Number of base pairs
  const count = 15;

  return (
    <div className="flex flex-col items-center justify-center h-[300px] w-20 relative select-none pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative w-full h-4 flex items-center justify-center"
        >
          {/* Connector Line (The Hydrogen Bond) */}
          <div
            className="absolute h-[1px] bg-bronze-600/30"
            style={{
              width: '30px',
              animation: 'spin 2s linear infinite',
              animationDelay: `-${i * 0.15}s`
            }}
          />

          {/* Strand 1 Particle */}
          <div
            className="dna-node-1 absolute w-2 h-2 rounded-full bg-bronze-500 shadow-[0_0_5px_rgba(205,127,50,0.8)]"
            style={{ animationDelay: `-${i * 0.15}s` }}
          ></div>

          {/* Strand 2 Particle */}
          <div
            className="dna-node-2 absolute w-2 h-2 rounded-full bg-garage-400 shadow-[0_0_5px_rgba(255,255,255,0.5)]"
            style={{ animationDelay: `-${i * 0.15}s` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default DNAHelix;