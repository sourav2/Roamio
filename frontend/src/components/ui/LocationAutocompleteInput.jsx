import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { travelApi } from '../../services/api';

/**
 * Roamio Location Autocomplete Input Component
 * 
 * Extracted reusable pattern from TripPreferenceForm and PlannerPage.
 * Preserves Nominatim OSM connection while strictly enforcing Roamio Design System tokens:
 * - Borders: Border Light (#DEDEDE), Focus: Primary Accent (#164A3A)
 * - Elevation: Medium Drop Shadow on dropdown list
 * - Hover: Secondary Background (#F8F6F0)
 * - Radius: 8px (Radius 2)
 * - Z-Index & Stacking: Portaled to document.body with fixed positioning (zIndex 100001) to prevent clipping or occlusion by ancestor stacking contexts (such as Drawers, Modals, and subsequent form controls).
 */
export default function LocationAutocompleteInput({
  label,
  placeholder = 'Enter city or region...',
  value = '',
  selectedLocation = null,
  onChange,
  onSelectLocation,
  onValidityChange,
  requireSelection = true,
  required = false,
  disabled = false,
  errorText,
  helperText,
  icon: Icon = MapPin,
  iconPosition = 'left', // 'left' | 'right'
  className = '',
  customAutocompleteService = null,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Distinguish typed input from canonical selected location
  const typedInput = typeof value === 'string' ? value : '';
  const hasTyped = typedInput.trim().length > 0;
  const hasSelection = Boolean(
    selectedLocation &&
    typeof selectedLocation.name === 'string' &&
    typedInput.trim().toLowerCase() === selectedLocation.name.trim().toLowerCase()
  );
  const isSelectionPending = requireSelection && hasTyped && !hasSelection;

  // Report validity to parent
  useEffect(() => {
    if (onValidityChange) {
      const isValid = required
        ? (hasTyped && hasSelection)
        : (!hasTyped || hasSelection || !requireSelection);
      onValidityChange(isValid);
    }
  }, [hasTyped, hasSelection, required, requireSelection, onValidityChange]);

  // Position dropdown relative to input bounding rectangle
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 100001,
        backgroundColor: '#FFFFFF',
      });
    }
  };

  // Update position on open, window resize, and scroll (catching ancestor containers)
  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen, suggestions]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const text = e.target.value;

    // Immediately invalidate previous selection if text doesn't match canonical name
    if (selectedLocation && text.trim().toLowerCase() !== (selectedLocation.name || '').trim().toLowerCase()) {
      if (onSelectLocation) onSelectLocation(null);
    }

    if (onChange) onChange(text);

    if (text.trim().length >= 1) {
      setIsLoading(true);
      try {
        const fetcher = customAutocompleteService || travelApi.autocomplete;
        const results = await fetcher(text);
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setDropdownStyle({
            position: 'fixed',
            top: `${rect.bottom + 4}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: 100001,
            backgroundColor: '#FFFFFF',
          });
        }
        setSuggestions(results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Location autocomplete query failed:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleFocus = async () => {
    const text = typedInput;
    updateDropdownPosition();
    if (suggestions.length > 0) {
      setIsOpen(true);
    } else if (text.trim().length >= 1 && !hasSelection) {
      setIsLoading(true);
      try {
        const fetcher = customAutocompleteService || travelApi.autocomplete;
        const results = await fetcher(text);
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setDropdownStyle({
            position: 'fixed',
            top: `${rect.bottom + 4}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: 100001,
            backgroundColor: '#FFFFFF',
          });
        }
        setSuggestions(results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Location autocomplete query failed on focus:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelect = (item) => {
    const rawName = item.name || '';
    const cleanName = rawName.split(',')[0].trim();
    const lat = item.lat !== undefined ? parseFloat(item.lat) : null;
    const lon = item.lon !== undefined ? parseFloat(item.lon) : null;
    const coords = lat !== null && lon !== null ? [lat, lon] : null;

    const selectionObj = {
      name: cleanName,
      fullName: rawName,
      coords: coords,
      raw: item,
    };

    if (onSelectLocation) {
      onSelectLocation(selectionObj);
    } else if (onChange) {
      onChange(cleanName);
    }

    setIsOpen(false);
    setSuggestions([]);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[focusedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full text-left font-roamio-body space-y-roamio-1">
      {label && (
        <label className="block text-sm font-medium text-roamio-text-primary leading-[20px]">
          {label}
          {required && <span className="text-roamio-semantic-danger ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className={`absolute ${iconPosition === 'right' ? 'right-roamio-3 text-roamio-primary-accent' : 'left-roamio-3 text-roamio-text-tertiary'} pointer-events-none flex items-center justify-center`}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-roamio-primary-accent" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={(e) => {
            if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
              return;
            }
            setTimeout(() => {
              setIsOpen(false);
            }, 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={`
            w-full h-[50px] bg-roamio-accent-secondary-10 text-roamio-text-primary placeholder:text-roamio-text-tertiary
            border rounded-roamio-2 text-sm leading-[20px]
            ${iconPosition === 'right' ? 'pl-roamio-3 pr-9' : 'pl-9 pr-roamio-3'}
            transition-all duration-200 outline-none
            ${errorText
              ? 'border-roamio-semantic-danger focus:border-roamio-semantic-danger focus:ring-1 focus:ring-roamio-semantic-danger' 
              : isSelectionPending
              ? 'border-roamio-semantic-warning focus:border-roamio-semantic-warning focus:ring-1 focus:ring-roamio-semantic-warning'
              : 'border-roamio-border-light focus:border-roamio-primary-accent focus:ring-1 focus:ring-roamio-primary-accent'
            }
            ${disabled ? 'bg-roamio-bg-secondary text-roamio-text-disabled cursor-not-allowed' : ''}
            ${className}
          `.trim()}
        />
      </div>

      {/* Portaled Suggestion Dropdown with z-index: 100001 */}
      {isOpen && suggestions.length > 0 && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={dropdownRef}
              style={dropdownStyle}
              className="bg-white bg-roamio-bg-card border border-roamio-border-light rounded-roamio-2 shadow-roamio-md max-h-48 overflow-y-auto divide-y divide-roamio-divider pointer-events-auto"
            >
              {suggestions.map((item, idx) => {
                const isFocused = idx === focusedIndex;
                return (
                  <li
                    key={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`
                      px-roamio-4 py-roamio-2 text-xs leading-[18px] text-roamio-text-primary cursor-pointer transition-colors duration-150 flex items-center justify-between
                      ${isFocused ? 'bg-roamio-bg-secondary font-medium' : 'hover:bg-roamio-bg-secondary bg-white'}
                    `.trim()}
                  >
                    <div className="flex items-center gap-roamio-2 truncate">
                      <MapPin className="h-3.5 w-3.5 text-roamio-text-tertiary shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.lat && (
                      <span className="text-3xs text-roamio-text-tertiary font-mono ml-2 shrink-0">
                        {parseFloat(item.lat).toFixed(2)}, {parseFloat(item.lon).toFixed(2)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>,
            document.body
          )
        : null}

      {errorText ? (
        <p className="text-xs text-roamio-semantic-danger leading-[16px]">{errorText}</p>
      ) : isSelectionPending ? (
        <p className="text-xs text-roamio-semantic-warning leading-[16px] font-medium">
          Please select a location from the suggestions
        </p>
      ) : helperText ? (
        <p className="text-xs text-roamio-text-secondary leading-[16px]">{helperText}</p>
      ) : null}
    </div>
  );
}
