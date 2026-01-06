import { useId } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Study Hub / Graduation Cap Icon
export function StudyIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M12 3L2 8l10 5 10-5-10-5z" fill={`url(#${gradientId})`} opacity="0.9"/>
      <path d="M2 17l10 5 10-5M6 10l6 3 6-3" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// Assignments / List Icon
export function AssignmentsIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Calendar / Timetable Icon
export function CalendarIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={`url(#${gradientId})`} strokeWidth="2"/>
      <path d="M16 2v4M8 2v4M3 10h18" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="8" cy="14" r="1" fill={`url(#${gradientId})`}/>
      <circle cx="12" cy="14" r="1" fill={`url(#${gradientId})`}/>
      <circle cx="16" cy="14" r="1" fill={`url(#${gradientId})`}/>
    </svg>
  );
}

// Analytics / Overview Icon
export function AnalyticsIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M3 3v18h18" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 16l4-6 4 4 5-8" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Sparkles / Special Icon
export function SparklesIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z" fill={`url(#${gradientId})`} opacity="0.9"/>
      <path d="M5 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM19 17l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill={`url(#${gradientId})`} opacity="0.7"/>
    </svg>
  );
}

// Settings / Gear Icon
export function SettingsIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke={`url(#${gradientId})`} strokeWidth="2"/>
    </svg>
  );
}

// Books / Library Icon
export function BooksIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill={`url(#${gradientId})`} opacity="0.2" stroke={`url(#${gradientId})`} strokeWidth="2"/>
      <path d="M8 7h8M8 11h6" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Idea / Light Bulb Icon
export function IdeaIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M12 2a7 7 0 014 12.83V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.17A7 7 0 0112 2z" fill={`url(#${gradientId})`} opacity="0.3" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 21h4M12 2v2" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// Trophy / Achievement Icon
export function TrophyIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 3h12v6a6 6 0 01-12 0V3z" fill={`url(#${gradientId})`} opacity="0.3" stroke={`url(#${gradientId})`} strokeWidth="2"/>
      <path d="M8 21h8M12 17v4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// Star Icon
export function StarIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#${gradientId})`} opacity="0.9"/>
    </svg>
  );
}

// Target / Goal Icon
export function TargetIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke={`url(#${gradientId})`} strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" stroke={`url(#${gradientId})`} strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill={`url(#${gradientId})`}/>
    </svg>
  );
}

// Search / Magnifying Glass Icon
export function SearchIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <circle cx="11" cy="11" r="8" stroke={`url(#${gradientId})`} strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// Chart / Growth Icon
export function ChartIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M3 3v18h18" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 12v8M12 8v12M17 4v16" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// Folder / Documents Icon
export function FolderIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-7l-2-2H5a2 2 0 00-2 2z" fill={`url(#${gradientId})`} opacity="0.2" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

// Chat / Message Icon
export function ChatIcon({ className = '', size = 24 }: IconProps) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
