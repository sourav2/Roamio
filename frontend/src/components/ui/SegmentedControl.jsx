import React from 'react';

/**
 * Roamio Segmented Control Component
 * 
 * Used for high-frequency mode selection like:
 * - Budget / Comfort / Premium
 * - Fastest / Cheapest / Comfortable
 * 
 * Strict Roamio Design System implementation:
 * - Container: Secondary Background (#F8F6F0), Border Light (#DEDEDE), Radius 2 (8px)
 * - Active Segment: Primary Accent (#164A3A), Text Inverse (#F8F6F0 / #FFFFFF), Drop Shadow Small
 * - Inactive Segment: Text Secondary (#5B6660), Hover: Text Primary (#1C2420)
 */
export default function SegmentedControl({
  options = [], // [{ value, label, icon: Icon, disabled }]
  value,
  onChange,
  isFullWidth = true,
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const sizeClasses = {
    sm: 'py-roamio-1 px-roamio-2 text-xs',
    md: 'py-roamio-2 px-roamio-3 text-xs',
  };

  return (
    <div
      role="radiogroup"
      className={`
        inline-flex items-center bg-roamio-bg-secondary p-1 rounded-roamio-2 border border-roamio-border-light font-roamio-body select-none
        ${isFullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={`
              flex items-center justify-center gap-roamio-1 font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-roamio-1
              ${isFullWidth ? 'flex-1 min-w-0' : ''}
              ${sizeClasses[size] || sizeClasses.md}
              ${isSelected
                ? 'bg-roamio-primary-accent text-white shadow-roamio-sm'
                : 'text-roamio-text-secondary hover:text-roamio-text-primary hover:bg-white/40'
              }
              ${opt.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
            `.trim()}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
