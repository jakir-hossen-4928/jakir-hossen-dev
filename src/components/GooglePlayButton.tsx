import React from 'react';

interface GooglePlayButtonProps {
  url: string;
  className?: string;
}

const GooglePlayButton: React.FC<GooglePlayButtonProps> = ({ url, className = '' }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-transform hover:scale-105 ${className}`}
    >
      <svg
        width="180"
        height="53"
        viewBox="0 0 180 53"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background */}
        <rect width="180" height="53" rx="6" fill="black" />
        
        {/* Google Play Logo */}
        <g transform="translate(12, 10)">
          {/* Triangle parts of Play logo */}
          <path
            d="M2.5 3.5L18.5 16.5L2.5 29.5V3.5Z"
            fill="url(#paint0_linear)"
          />
          <path
            d="M18.5 16.5L2.5 3.5L14 1L18.5 16.5Z"
            fill="url(#paint1_linear)"
          />
          <path
            d="M18.5 16.5L14 32L2.5 29.5L18.5 16.5Z"
            fill="url(#paint2_linear)"
          />
          <path
            d="M18.5 16.5L14 1L24 6.5L18.5 16.5Z"
            fill="url(#paint3_linear)"
          />
          <path
            d="M18.5 16.5L24 26.5L14 32L18.5 16.5Z"
            fill="url(#paint4_linear)"
          />
        </g>

        {/* Text */}
        <text x="45" y="18" fill="white" fontSize="8" fontFamily="Arial, sans-serif">
          GET IT ON
        </text>
        <text x="45" y="35" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">
          Google Play
        </text>

        {/* Gradients */}
        <defs>
          <linearGradient id="paint0_linear" x1="2.5" y1="16.5" x2="18.5" y2="16.5">
            <stop stopColor="#00D7FE" />
            <stop offset="1" stopColor="#00A1FF" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="8.25" y1="2.25" x2="14" y2="8.75">
            <stop stopColor="#FFD800" />
            <stop offset="1" stopColor="#FF8A00" />
          </linearGradient>
          <linearGradient id="paint2_linear" x1="8.25" y1="30.75" x2="14" y2="24.25">
            <stop stopColor="#FF3A44" />
            <stop offset="1" stopColor="#B11162" />
          </linearGradient>
          <linearGradient id="paint3_linear" x1="19" y1="3.75" x2="21.25" y2="11.5">
            <stop stopColor="#FFD800" />
            <stop offset="1" stopColor="#FF8A00" />
          </linearGradient>
          <linearGradient id="paint4_linear" x1="19" y1="29.25" x2="21.25" y2="21.5">
            <stop stopColor="#FF3A44" />
            <stop offset="1" stopColor="#B11162" />
          </linearGradient>
        </defs>
      </svg>
    </a>
  );
};

export default GooglePlayButton;
