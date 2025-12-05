import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f59e0b" /> {/* amber-500 */}
        <stop offset="50%" stopColor="#d97706" /> {/* amber-600 */}
        <stop offset="100%" stopColor="#fffbeb" /> {/* amber-50 (highlight) */}
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    
    {/* Main Shape Group with Shadow */}
    <g filter="url(#shadow)">
      {/* Speech Bubble Container */}
      <path 
        d="M50 10C27.9086 10 10 26.1178 10 46C10 58.0772 16.2741 68.7905 26 75.5625V90L40.7305 81.5829C43.6826 82.1979 46.7844 82.5263 50 82.5263C72.0914 82.5263 90 66.4085 90 46.5263C90 26.6441 72.0914 10 50 10Z" 
        fill="url(#logoGradient)" 
      />
      
      {/* Negative Space: Classical Column (Color matches app dark bg #171717 / #1a1a1a) */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M38 30C38 28.3431 39.3431 27 41 27H59C60.6569 27 62 28.3431 62 30V33H38V30ZM38 36H42V60H38V36ZM46 36H50V60H46V36ZM54 36H58V60H54V36ZM36 63C36 61.3431 37.3431 60 39 60H61C62.6569 60 64 61.3431 64 63V66H36V63Z" 
        fill="#171717" 
      />
    </g>

    {/* AI Sparkle Accent */}
    <path 
      d="M82 20L84.5 26L90 28L84.5 30L82 36L79.5 30L74 28L79.5 26L82 20Z" 
      fill="#fbbf24"
    />
  </svg>
);