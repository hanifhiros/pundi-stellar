import React from "react";

interface FlagIconProps {
  code: string;
  className?: string;
}

export function FlagIcon({ code, className = "w-6 h-6" }: FlagIconProps) {
  const baseClasses = `rounded-full border border-gray-200 shadow-sm overflow-hidden inline-block shrink-0 ${className}`;

  switch (code.toUpperCase()) {
    case "SGD":
      return (
        <svg className={baseClasses} viewBox="0 0 15 10">
          <rect width="15" height="5" fill="#df2027" />
          <rect y="5" width="15" height="5" fill="#ffffff" />
          <path
            d="M 2.5,1.25 A 1.25,1.25 0 0,0 2.5,3.75 A 1.1,1.1 0 0,1 2.5,1.25"
            fill="#ffffff"
          />
          <circle cx="4.2" cy="1.5" r="0.25" fill="#ffffff" />
          <circle cx="4.8" cy="2.0" r="0.25" fill="#ffffff" />
          <circle cx="4.6" cy="2.7" r="0.25" fill="#ffffff" />
          <circle cx="3.8" cy="2.7" r="0.25" fill="#ffffff" />
          <circle cx="3.6" cy="2.0" r="0.25" fill="#ffffff" />
        </svg>
      );
    case "HKD":
      return (
        <svg className={baseClasses} viewBox="0 0 3 2">
          <rect width="3" height="2" fill="#de2910" />
          <circle cx="1.5" cy="1" r="0.4" fill="#ffffff" />
        </svg>
      );
    case "MYR":
      return (
        <svg className={baseClasses} viewBox="0 0 14 8">
          <rect width="14" height="8" fill="#ffffff" />
          <rect width="14" height="0.57" fill="#cc0000" />
          <rect y="1.14" width="14" height="0.57" fill="#cc0000" />
          <rect y="2.28" width="14" height="0.57" fill="#cc0000" />
          <rect y="3.42" width="14" height="0.57" fill="#cc0000" />
          <rect y="4.56" width="14" height="0.57" fill="#cc0000" />
          <rect y="5.7" width="14" height="0.57" fill="#cc0000" />
          <rect y="6.84" width="14" height="0.57" fill="#cc0000" />
          <rect width="7" height="4.56" fill="#002b7f" />
        </svg>
      );
    case "KRW":
      return (
        <svg className={`${baseClasses} bg-white`} viewBox="-5 -5 10 10">
          <circle r="2.5" fill="#df2027" />
          <path d="M 0 0 A 1.25 1.25 0 0 0 0 2.5 A 1.25 1.25 0 0 1 0 0" fill="#0047a0" />
          <path d="M 0 -2.5 A 1.25 1.25 0 0 1 0 0 A 1.25 1.25 0 0 1 0 -2.5" fill="#df2027" />
          <path d="M 0 0 A 1.25 1.25 0 0 0 0 2.5" fill="#0047a0" />
        </svg>
      );
    case "USD":
    default:
      return (
        <svg className={baseClasses} viewBox="0 0 19 10">
          <rect width="19" height="10" fill="#bf0a30" />
          <rect y="0.77" width="19" height="0.77" fill="#ffffff" />
          <rect y="2.31" width="19" height="0.77" fill="#ffffff" />
          <rect y="3.85" width="19" height="0.77" fill="#ffffff" />
          <rect y="5.38" width="19" height="0.77" fill="#ffffff" />
          <rect y="6.92" width="19" height="0.77" fill="#ffffff" />
          <rect y="8.46" width="19" height="0.77" fill="#ffffff" />
          <rect width="7.6" height="5.38" fill="#002868" />
        </svg>
      );
  }
}
