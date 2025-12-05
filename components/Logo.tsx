import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="logoGradient" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" /> {/* amber-500 */}
        <stop offset="1" stopColor="#d97706" /> {/* amber-600 */}
      </linearGradient>
    </defs>
    
    {/* Speech Bubble Base */}
    <path 
      d="M21 11.5C21 16.1944 16.9706 20 12 20C9.86656 20 7.91036 19.2965 6.33333 18.1111L3 20V15.6889C2.36402 14.4514 2 13.0189 2 11.5C2 6.80558 6.02944 3 11 3C15.9706 3 20 6.80558 20 11.5Z" 
      stroke="url(#logoGradient)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Classical Column stylized inside */}
    {/* Capital (Top) */}
    <path d="M8 8H16" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 8C7 8 7.5 7 8 7H16C16.5 7 17 8 17 8" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

    {/* Flutes (Vertical Lines) */}
    <path d="M9 8.5V15" stroke="url(#logoGradient)" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M12 8.5V15" stroke="url(#logoGradient)" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M15 8.5V15" stroke="url(#logoGradient)" strokeWidth="1.2" strokeLinecap="round" />
    
    {/* Base (Bottom) */}
    <path d="M7 15H17" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);