import React from 'react';

interface EchoRobotLogoProps extends React.SVGProps<SVGSVGElement> {}

export default function EchoRobotLogo(props: EchoRobotLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Antennas */}
      <line x1="35" y1="18" x2="35" y2="11" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="32" y1="11" x2="38" y2="11" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      
      <line x1="65" y1="18" x2="65" y2="11" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="62" y1="11" x2="68" y2="11" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />

      {/* Ears */}
      <rect x="18" y="32" width="6" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="76" y="32" width="6" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />

      {/* Head Outer */}
      <rect x="24" y="18" width="52" height="38" rx="14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      
      {/* Head Inner screen */}
      <rect x="30" y="24" width="40" height="26" rx="8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />

      {/* Eyes */}
      <circle cx="38" cy="35" r="5" fill="currentColor" />
      <circle cx="62" cy="35" r="5" fill="currentColor" />

      {/* Mouth */}
      <rect x="45" y="44" width="10" height="3" fill="currentColor" rx="1" />

      {/* Body */}
      <rect x="34" y="56" width="32" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />

      {/* Chest Details */}
      <rect x="42" y="62" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <line x1="45" y1="67" x2="55" y2="67" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />

      {/* Left Arm */}
      <path d="M 34 62 C 22 62, 20 70, 22 78" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Left Hand / Claw */}
      <path d="M 22 78 C 16 78, 16 86, 22 86 C 26 86, 26 80, 22 80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Right Arm */}
      <path d="M 66 62 C 78 62, 80 70, 78 78" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Right Hand / Claw */}
      <path d="M 78 78 C 84 78, 84 86, 78 86 C 74 86, 74 80, 78 80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Feet */}
      <path d="M 38 78 L 32 94 L 46 94 L 46 78" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M 62 78 L 68 94 L 54 94 L 54 78" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}
