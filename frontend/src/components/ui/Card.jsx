import React from 'react';

/**
 * Roamio Card Component
 * 
 * Strict Roamio Design System implementation:
 * - Background: Card / #FFFFFF
 * - Border: Border Light / #DEDEDE
 * - Border Width: Stroke 1 / 1px
 * - Radius: Radius 3 / 12px (default) or Radius 4 / 16px
 * - Elevation: Small / 0px 1px 3px rgba(17,24,39,0.08)
 */
export default function Card({
  children,
  className = '',
  elevation = 'sm', // 'none' | 'sm' | 'md' | 'lg' | 'xl'
  radius = '3', // '1' | '2' | '3' | '4'
  isHoverable = false,
  isSecondaryBg = false,
  onClick,
  ...props
}) {
  const elevationClasses = {
    none: 'shadow-roamio-zero',
    sm: 'shadow-roamio-sm',
    md: 'shadow-roamio-md',
    lg: 'shadow-roamio-lg',
    xl: 'shadow-roamio-xl',
  };

  const radiusClasses = {
    '1': 'rounded-roamio-1',
    '2': 'rounded-roamio-2',
    '3': 'rounded-roamio-3',
    '4': 'rounded-roamio-4',
  };

  const hoverClass = isHoverable
    ? 'hover:shadow-roamio-md hover:border-roamio-border-default transition-all duration-200 cursor-pointer'
    : '';

  const bgClass = isSecondaryBg ? 'bg-roamio-bg-secondary' : 'bg-roamio-card';

  return (
    <div
      onClick={onClick}
      className={`
        ${bgClass} border border-roamio-border-light
        ${radiusClasses[radius] || radiusClasses['3']}
        ${elevationClasses[elevation] || elevationClasses.sm}
        ${hoverClass} font-roamio-body text-roamio-text-primary text-left
        overflow-hidden ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div 
      className={`px-roamio-5 py-roamio-4 border-b border-roamio-divider flex items-center justify-between ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-roamio-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div 
      className={`px-roamio-5 py-roamio-3 border-t border-roamio-divider bg-roamio-bg-secondary/40 flex items-center justify-between ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
}
