import { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon';
}

export function Logo({ className = '', size = 40, variant = 'full' }: LogoProps) {
  // Generate unique ID for gradient to prevent conflicts when multiple logos are rendered
  const gradientId = useId();

  const logoIcon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'icon' ? className : ''}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>

      {/* Flowing book/pages design */}
      <path
        d="M20 30 Q30 20, 50 25 T80 30 L80 70 Q70 75, 50 70 T20 70 Z"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
      <path
        d="M25 35 Q35 28, 50 32 T75 35 L75 65 Q65 70, 50 65 T25 65 Z"
        fill={`url(#${gradientId})`}
        opacity="0.7"
      />
      <path
        d="M30 40 Q40 35, 50 38 T70 40 L70 60 Q60 63, 50 60 T30 60 Z"
        fill={`url(#${gradientId})`}
        opacity="0.5"
      />

      {/* Central flowing line */}
      <path
        d="M50 25 Q50 40, 50 50 T50 75"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );

  if (variant === 'icon') {
    return logoIcon;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoIcon}
      <span
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap"
        style={{ fontSize: size * 0.6 }}
      >
        StudyFlow
      </span>
    </div>
  );
}
