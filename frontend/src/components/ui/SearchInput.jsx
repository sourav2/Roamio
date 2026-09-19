import React, { useRef, useEffect } from 'react';
import { Search, X, Mic } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

/**
 * Roamio Shared Search Input Component
 * 
 * Reusable search bar pattern with integrated text & Web Speech API voice input:
 * - Search icon (left, toggleable)
 * - Text typing with controlled state
 * - Clear action (X) when value exists
 * - Voice dictation via native browser Web Speech API
 * - Visually consistent microphone with Roamio design tokens
 * - Active listening indicator (Semantic Danger Red token)
 * - Safe error handling (denied mic permission, device errors)
 * - Proper right padding preventing text collisions
 */
export default function SearchInput({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Ask AI or search destinations...',
  isPill = false,
  disabled = false,
  showVoice = true,
  showSearchIcon = true,
  className = '',
  inputClassName = '',
  autoFocus = false,
  trailingAction,
  variant = 'default',
  ...props
}) {
  const initialValueRef = useRef('');
  const {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    clearError,
  } = useSpeechRecognition();

  // Auto-dismiss transient speech errors after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const triggerSearch = (searchVal = value) => {
    if (isListening) {
      stopListening();
    }
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch(value);
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    triggerSearch(value);
  };

  const handleClear = () => {
    if (isListening) {
      stopListening();
    }
    if (onChange) onChange({ target: { value: '', name: props.name } });
    if (onClear) onClear();
  };

  const handleToggleVoice = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || !isSupported) return;

    if (isListening) {
      stopListening();
    } else {
      // Preserve existing text so user can dictate additional query terms
      initialValueRef.current = value || '';

      startListening({
        onTranscript: (speechText) => {
          if (!onChange) return;

          const base = initialValueRef.current;
          let combinedText = speechText;

          if (base && base.trim()) {
            // Append speech to existing text separated by a space
            combinedText = `${base.trim()} ${speechText.trimStart()}`;
          }

          onChange({
            target: {
              value: combinedText,
              name: props.name,
            },
          });
        },
        onEnd: () => {
          // Finished naturally when speaker paused; do not auto-submit search
        },
      });
    }
  };

  const radiusClass = isPill ? "rounded-roamio-full" : "rounded-roamio-3";
  const leftPadding = showSearchIcon ? "pl-12" : "pl-5";
  
  // Right padding accounts for clear button + mic button
  const hasMultipleRightActions = (value && !disabled && showVoice) || (showVoice && trailingAction);
  const rightPadding = hasMultipleRightActions ? "pr-20" : (showVoice || value || trailingAction ? "pr-14" : "pr-5");

  const micTooltip = !isSupported
    ? "Speech recognition is not supported in this browser"
    : error
    ? error
    : isListening
    ? "Listening... (Click to stop)"
    : "Search by voice";

  return (
    <div className={`relative flex items-center w-full font-roamio-body text-left ${className}`.trim()}>
      {showSearchIcon && (
        <button
          type="button"
          onClick={handleSearchClick}
          aria-label="Search"
          title="Search"
          className="absolute left-roamio-4 top-1/2 -translate-y-1/2 text-roamio-primary-accent hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center p-0.5 z-10"
        >
          <Search className="h-5 w-5" />
        </button>
      )}

      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          w-full h-[56px] ${leftPadding} ${rightPadding}
          text-[18px] leading-[24px] font-normal roamio-body-lg
          bg-white text-roamio-text-primary placeholder:text-roamio-text-tertiary placeholder:text-[18px] placeholder:leading-[24px] placeholder:font-normal
          border border-roamio-primary-accent ${radiusClass}
          transition-all duration-150 outline-none
          focus:border-2 focus:border-roamio-primary-accent focus:ring-0 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${inputClassName}
        `.trim()}
        {...props}
      />

      {/* Right Action Cluster: Clear Button + Voice Mic + Optional Trailing Action */}
      <div className="absolute right-roamio-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Clear button if text exists */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-roamio-text-tertiary hover:text-roamio-text-primary p-1 rounded-roamio-1 transition cursor-pointer"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Voice dictation microphone button with recognizable silhouette & prominent sizing */}
        {showVoice && (
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={disabled || !isSupported}
            aria-label={isListening ? "Stop voice input" : "Search by voice"}
            title={micTooltip}
            className={`
              p-1.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center
              ${!isSupported ? 'opacity-40 cursor-not-allowed text-roamio-text-tertiary' : ''}
              ${isListening
                ? 'text-[var(--roamio-semantic-danger,#DC2626)] bg-[var(--roamio-semantic-danger-bg,#FEF2F2)] ring-2 ring-[var(--roamio-semantic-danger,#DC2626)]/50 animate-pulse'
                : 'text-roamio-primary-accent hover:opacity-80'
              }
            `.trim()}
          >
            <Mic className="w-[18px] h-[23px] shrink-0" strokeWidth={2.2} />
          </button>
        )}

        {trailingAction && (
          <div className="flex items-center">
            {trailingAction}
          </div>
        )}
      </div>

      {/* Subtle floating error notice if permission was denied or failed */}
      {error && (
        <div className="absolute -bottom-7 left-2 text-[11px] font-medium text-[var(--roamio-semantic-danger,#DC2626)] bg-[var(--roamio-semantic-danger-bg,#FEF2F2)] px-2 py-0.5 rounded border border-[var(--roamio-semantic-danger,#DC2626)]/20 shadow-2xs pointer-events-none z-20">
          {error}
        </div>
      )}
    </div>
  );
}
