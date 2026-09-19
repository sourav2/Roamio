import React, { forwardRef } from 'react';

/**
 * Roamio Input Component
 * 
 * Strict Roamio Design System implementation:
 * - Typography: Body sm (14px/20px) / Body md (16px/22px)
 * - Borders: Border Light (#DEDEDE), Focus: Primary Accent (#164A3A), Error: Danger (#DC2626)
 * - Radius: 8px (Radius 2)
 * - Background: App Background (#FFFFFF)
 */
const Input = forwardRef(function Input({
  label,
  helperText,
  errorText,
  icon: Icon,
  iconPosition = 'left',
  trailingElement,
  disabled = false,
  required = false,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}, ref) {
  const inputId = id || (label ? `roamio-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const isError = Boolean(errorText);

  return (
    <div className={`w-full text-left font-roamio-body space-y-roamio-1 ${wrapperClassName}`.trim()}>
      {/* Optional Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-roamio-text-primary leading-[20px]"
        >
          {label}
          {required && <span className="text-roamio-semantic-danger ml-0.5">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative flex items-center">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-roamio-3 text-roamio-text-tertiary pointer-events-none flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={`
            w-full h-[50px] bg-roamio-accent-secondary-10 text-roamio-text-primary placeholder:text-roamio-text-tertiary
            border rounded-roamio-2 text-sm leading-[20px] transition-all duration-200 outline-none
            ${Icon && iconPosition === 'left' ? 'pl-9' : 'pl-roamio-3'}
            ${(Icon && iconPosition === 'right') || trailingElement ? 'pr-9' : 'pr-roamio-3'}
            ${isError 
              ? 'border-roamio-semantic-danger focus:border-roamio-semantic-danger focus:ring-1 focus:ring-roamio-semantic-danger' 
              : 'border-roamio-border-light focus:border-roamio-primary-accent focus:ring-1 focus:ring-roamio-primary-accent'
            }
            ${disabled ? 'bg-roamio-bg-secondary text-roamio-text-disabled cursor-not-allowed border-roamio-border-light' : ''}
            ${className}
          `.trim()}
          {...props}
        />

        {Icon && iconPosition === 'right' && !trailingElement && (
          <div className="absolute right-roamio-3 text-roamio-text-tertiary pointer-events-none flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        )}

        {trailingElement && (
          <div className="absolute right-roamio-2 flex items-center">
            {trailingElement}
          </div>
        )}
      </div>

      {/* Error or Helper text */}
      {isError ? (
        <p className="text-xs text-roamio-semantic-danger leading-[16px]">
          {errorText}
        </p>
      ) : helperText ? (
        <p className="text-xs text-roamio-text-secondary leading-[16px]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
