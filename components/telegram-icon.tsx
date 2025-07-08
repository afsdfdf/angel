import React from "react";

export function TelegramIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21.73 3.73a2 2 0 0 0-2.82-.3L3.5 13.72a2 2 0 0 0-.2 3.2L5.1 18.7a2 2 0 0 0 2.7.3l1.7-1.2a.5.5 0 0 1 .7.15l1.8 2.9a2 2 0 0 0 3.7-.45L20.89 5.5a2 2 0 0 0-.57-2.17" />
      <path d="M9.5 14.5 17 7" />
    </svg>
  );
} 