import React from 'react';
import { X } from 'lucide-react';

/**
 * Roamio Chip / Filter Component
 * 
 * Strict Roamio Design System implementation:
 * - Radius: Radius Full = 9999px (Pill treatment)
 * - Selected State: Primary Accent background (#164A3A), Text Inverse (#F8F6F0 / #FFFFFF)
 * - Unselected State: Secondary Background (#F8F6F0), Border Light (#DEDEDE), Text Primary (#1C2420)
 * - Hover State: Border Default (#C0C0C0), Background Card (#FFFFFF)
 * - Spacing: Spacing 1 (4px) vertically, Spacing 3 (12px) / 4 (16px) horizontally
 */
export default function Chip({
  children,
  label,
  selected = false,
  onClick,
  onRemove,
  icon: Icon,
  emoji,
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'control'
  variant = 'default', // 'default' | 'white' | 'filter'
  selectedVariant = 'primary', // 'primary' | 'light'
  radius = '1', // '1' (4px default) | '2' | 'full'
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'py-roamio-1 px-roamio-2.5 text-xs leading-[16px] gap-roamio-1',
    md: 'py-roamio-1 px-roamio-3 text-xs sm:text-sm leading-[20px] font-medium gap-roamio-2',
    control: 'py-roamio-2 px-roamio-3 text-xs sm:text-sm font-medium gap-roamio-2',
    filter: 'py-roamio-1 px-[10px] roamio-body-xs gap-roamio-1',
  };

  const isClickable = Boolean(onClick) && !disabled;

  let unselectedBgClass = 'bg-roamio-bg-secondary border-roamio-border-light text-roamio-text-primary hover:border-roamio-border-default hover:bg-white';
  if (variant === 'white') {
    unselectedBgClass = 'bg-white border-roamio-border-light text-roamio-text-primary hover:border-roamio-border-default';
  } else if (variant === 'filter') {
    unselectedBgClass = 'bg-white border-roamio-primary-accent text-roamio-primary-accent hover:bg-roamio-primary-accent/5';
  }

  const selectedBgClass = selectedVariant === 'light'
    ? 'bg-roamio-btn-light border-roamio-btn-light text-white shadow-roamio-sm'
    : 'bg-roamio-primary-accent border-roamio-primary-accent text-white shadow-roamio-sm';

  const radiusClasses = {
    '1': 'rounded-[4px]',
    '2': 'rounded-roamio-2',
    'full': 'rounded-roamio-full',
  };
  const radiusClass = radiusClasses[radius] || 'rounded-[4px]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={isClickable ? onClick : undefined}
      className={`
        inline-flex items-center justify-center ${radiusClass} border transition-all duration-200 select-none font-roamio-body
        ${sizeClasses[size] || sizeClasses.md}
        ${selected ? selectedBgClass : unselectedBgClass}
        ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {emoji && <span className="text-sm -ml-0.5">{emoji}</span>}
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{children ?? label}</span>

      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onRemove();
          }}
          className={`
            ml-0.5 -mr-1 p-0.5 rounded-roamio-full transition-colors cursor-pointer
            ${selected ? 'hover:bg-white/20 text-white' : 'hover:bg-roamio-border-light text-roamio-text-tertiary hover:text-roamio-text-primary'}
          `.trim()}
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
