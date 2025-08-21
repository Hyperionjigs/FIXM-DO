import React from 'react';

interface FixMoIconProps {
  className?: string;
  size?: number;
}

export const FixMoIcon: React.FC<FixMoIconProps> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center rounded-md bg-blue-500 text-white font-bold ${className}`}
      style={{ 
        width: size, 
        height: size,
        fontSize: `${size * 0.6}px`
      }}
    >
      F
    </div>
  );
}; 