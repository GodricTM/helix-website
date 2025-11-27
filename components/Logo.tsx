
import React from 'react';

interface LogoProps {
  className?: string;
  logoUrl?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10", logoUrl }) => {
  return (
    <img
      src={logoUrl || "/logo.PNG"}
      alt="Helix Motorcycles"
      className={`object-contain drop-shadow-[0_0_8px_rgba(205,127,50,0.5)] hover:drop-shadow-[0_0_12px_rgba(205,127,50,0.8)] transition-all duration-300 ${className}`}
    />
  );
};

export default Logo;
