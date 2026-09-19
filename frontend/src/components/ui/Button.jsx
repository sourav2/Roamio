import React from 'react';

/**
 * Roamio Button Component
 * 
 * Strict Roamio Design System implementation:
 * - Typography: Label / Button (Inter Medium, 16px / 22px)
 * - Primary: #164A3A, Primary Hover: #0E3227
 * - Stroke: 1px default
 * - Radius: 8px default (Radius 2) or 9999px (Radius Full)
 */
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  isFullWidth = false,
  isPill = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) {
  // Base styling adhering to Roamio Global Design System specs: Height 48px, Body MD Medium (16px), 48px px, 12px py
  const baseClasses = "inline-flex items-center justify-center font-roamio-body roamio-body-md-medium text-[16px] leading-[22px] transition-all duration-200 select-none cursor-pointer border focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]";

  // Radius token
  const radiusClass = isPill ? "rounded-roamio-full" : "rounded-roamio-2";

  // Global button dimensions: 48px height, 48px horizontal padding (px-roamio-9), 12px vertical padding (py-roamio-3)
  const sizeClasses = {
    sm: "h-[48px] px-roamio-9 py-roamio-3 text-[16px] leading-[22px] gap-roamio-2",
    md: "h-[48px] px-roamio-9 py-roamio-3 text-[16px] leading-[22px] gap-roamio-2",
    lg: "h-[48px] px-roamio-9 py-roamio-3 text-[16px] leading-[22px] gap-roamio-3",
  };

  // Variants adhering strictly to Roamio colors
  const variantClasses = {
    primary: "bg-roamio-primary-accent hover:bg-roamio-primary-hover text-white border-transparent focus:ring-roamio-primary-accent shadow-roamio-sm",
    secondary: "bg-roamio-bg-secondary hover:bg-white text-roamio-text-primary border-roamio-border-light hover:border-roamio-border-default focus:ring-roamio-text-primary",
    outline: "bg-transparent hover:bg-roamio-bg-secondary text-roamio-primary-accent border-roamio-primary-accent focus:ring-roamio-primary-accent",
    danger: "bg-roamio-semantic-danger hover:bg-[#B91C1C] text-white border-transparent focus:ring-roamio-semantic-danger shadow-roamio-sm",
    success: "bg-roamio-semantic-success hover:bg-[#238058] text-white border-transparent focus:ring-roamio-semantic-success shadow-roamio-sm",
  };

  const widthClass = isFullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${radiusClass} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
