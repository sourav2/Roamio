import React from 'react';

/**
 * Roamio Material Design-Style Slider Component
 * 
 * Shared slider component for Trip Duration, Budget, and any continuous or stepped controls:
 * - Material 3-style rounded track with active (#176B53) and inactive (#D6E0DA) segments
 * - Material 3-style vertical capsule pill thumb handle (#176B53, w-[5px] x h-[18px])
 * - Subtle end-cap stop indicator dot
 * - Full accessibility with transparent native range input layer
 */
export default function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  ariaLabel = 'Slider',
  className = '',
  ...props
}) {
  const numericValue = typeof value === 'number' ? value : Number(value) || min;
  const clampedValue = Math.min(Math.max(numericValue, min), max);
  const percentage = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  const handleChange = (e) => {
    if (disabled) return;
    const newVal = Number(e.target.value);
    if (onChange) {
      onChange(newVal);
    }
  };

  return (
    <div className={`relative w-full h-7 flex items-center select-none font-roamio-body ${className}`.trim()}>
      {/* 1. Inactive Track with rounded ends and subtle stop indicator */}
      <div className="relative w-full h-[6px] bg-[#D6E0DA] rounded-full overflow-hidden">
        {/* Active Track (Roamio Primary Accent) */}
        <div
          className="h-full bg-roamio-primary-accent rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stop Indicator Dot at Track End */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-roamio-primary-accent pointer-events-none" />

      {/* 2. Material-Style Vertical Capsule Pill Thumb Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center"
        style={{ left: `${percentage}%` }}
      >
        <div className="w-[5px] h-[18px] bg-roamio-primary-accent rounded-full shadow-2xs" />
      </div>

      {/* 3. Native Accessible Range Input Layer */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampedValue}
        onChange={handleChange}
        onInput={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        {...props}
      />
    </div>
  );
}
