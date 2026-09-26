import React from 'react';

/**
 * Roamio Tabs Component
 * 
 * Reusable tab navigation:
 * - Active: Primary Accent (#176B53) border and text
 * - Inactive: Text Secondary (#5B6660), Hover: Text Primary (#1C2420)
 * - Stroke: 2px active indicator
 * - Variants: 'line' (standard underline) and 'pills'
 */
export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon, disabled, badge }]
  activeTab,
  onChange,
  variant = 'line', // 'line' | 'pills'
  className = '',
}) {
  return (
    <div 
      role="tablist"
      className={`
        flex items-center overflow-x-auto scrollbar-none font-roamio-body
        ${variant === 'line' ? 'border-b border-roamio-divider gap-roamio-3' : 'gap-roamio-2 bg-roamio-bg-secondary p-roamio-1 rounded-roamio-2 border border-roamio-border-light'}
        ${className}
      `.trim()}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={`
                flex items-center gap-roamio-2 px-roamio-3 py-roamio-1 rounded-roamio-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer select-none whitespace-nowrap
                ${isActive 
                  ? 'bg-roamio-primary-accent text-white shadow-roamio-sm' 
                  : 'text-roamio-text-secondary hover:text-roamio-text-primary hover:bg-white/60'
                }
                ${tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
              `.trim()}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-3xs font-semibold px-1.5 py-0.2 rounded-roamio-full ${isActive ? 'bg-white/20 text-white' : 'bg-roamio-border-light text-roamio-text-secondary'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Default 'line' variant
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`
              relative flex items-center gap-roamio-2 py-roamio-2 px-roamio-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-roamio-primary-accent
              ${isActive
                ? 'text-roamio-primary-accent border-b-2 border-roamio-primary-accent'
                : 'text-roamio-text-secondary hover:text-roamio-text-primary border-b-2 border-transparent'
              }
              ${tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
            `.trim()}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-3xs font-semibold px-1.5 py-0.5 rounded-roamio-full ${isActive ? 'bg-roamio-semantic-success-bg text-roamio-primary-accent' : 'bg-roamio-bg-secondary text-roamio-text-secondary border border-roamio-border-light'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
