import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 88.5L44.2 83.2C23.6 64.5 10 52.2 10 37C10 24.6 19.6 15 32 15C39 15 45.8 18.2 50 23.2C54.2 18.2 61 15 68 15C80.4 15 90 24.6 90 37C90 52.2 76.4 64.5 55.8 83.2L50 88.5Z"
        fill="#00B8A9"
      />
      <path
        d="M20 50H35L45 30L55 70L65 40H80"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;