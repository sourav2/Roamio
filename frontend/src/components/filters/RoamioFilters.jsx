import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Minus, Plus } from 'lucide-react';
import Input from '../ui/Input';
import LocationAutocompleteInput from '../ui/LocationAutocompleteInput';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import Slider from '../ui/Slider';
import {
  MAX_TRAVEL_TIME_OPTIONS,
  TRAVEL_MODE_OPTIONS,
  ACCOMMODATION_OPTIONS,
  CROWD_LEVEL_OPTIONS,
  TRIP_TYPE_OPTIONS,
  DEFAULT_FILTER_STATE,
} from '../../config/filterConfig';

/**
 * Shared Roamio Filter System
 * 
 * Single source of truth for Roamio preference & filter controls.
 * Consumed by:
 * 1. Results Dashboard Left Filters Panel (layout="card")
 * 2. Home Page Manual Preferences Slide-Over Drawer (layout="plain")
 */
const RoamioFilters = forwardRef(function RoamioFilters({
  layout = 'card', // 'card' | 'plain'
  title = 'Filters',
  showHeader = true,
  showSubmit = true,
  submitLabel = 'Submit',
  initialValues,
  onChange,
  onSubmit,
  onReset,
  onValidityChange,
  className = '',
}, ref) {
  // Canonical selected objects and typed input values
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (initialValues?.selectedLocation) return initialValues.selectedLocation;
    if (initialValues?.location && typeof initialValues.location === 'string' && initialValues.location.trim()) {
      return {
        name: initialValues.location.trim(),
        fullName: initialValues.location.trim(),
        coords: null,
      };
    }
    return DEFAULT_FILTER_STATE.selectedLocation;
  });
  const [locationTyped, setLocationTyped] = useState(
    initialValues?.locationTyped ??
    initialValues?.location ??
    DEFAULT_FILTER_STATE.location ??
    ''
  );

  const [selectedDestination, setSelectedDestination] = useState(() => {
    if (initialValues?.selectedDestination) return initialValues.selectedDestination;
    if (initialValues?.destination && typeof initialValues.destination === 'string' && initialValues.destination.trim() && initialValues.destination.toLowerCase() !== 'any destination') {
      return {
        name: initialValues.destination.trim(),
        fullName: initialValues.destination.trim(),
        coords: null,
      };
    }
    return null;
  });
  const [destinationTyped, setDestinationTyped] = useState(
    initialValues?.destinationTyped ??
    (initialValues?.destination && initialValues.destination.toLowerCase() !== 'any destination' ? initialValues.destination : '') ??
    ''
  );

  const hasDestinationTyped = Boolean(
    destinationTyped &&
    destinationTyped.trim().length > 0 &&
    destinationTyped.trim().toLowerCase() !== 'any destination'
  );

  const [travellers, setTravellers] = useState(initialValues?.travellers ?? DEFAULT_FILTER_STATE.travellers);
  const [travellerCount, setTravellerCount] = useState(initialValues?.travellerCount ?? DEFAULT_FILTER_STATE.travellerCount);
  const [duration, setDuration] = useState(initialValues?.duration ?? DEFAULT_FILTER_STATE.duration);
  const [budget, setBudget] = useState(initialValues?.budget ?? DEFAULT_FILTER_STATE.budget);
  const [maxTravelTime, setMaxTravelTime] = useState(initialValues?.maxTravelTime ?? DEFAULT_FILTER_STATE.maxTravelTime);
  const [travelMode, setTravelMode] = useState(initialValues?.travelMode ?? DEFAULT_FILTER_STATE.travelMode);
  const [selectedTripTypes, setSelectedTripTypes] = useState(initialValues?.selectedTripTypes ?? DEFAULT_FILTER_STATE.selectedTripTypes);
  const [accommodationType, setAccommodationType] = useState(initialValues?.accommodationType ?? DEFAULT_FILTER_STATE.accommodationType);
  const [crowdLevel, setCrowdLevel] = useState(initialValues?.crowdLevel ?? DEFAULT_FILTER_STATE.crowdLevel);

  // Synchronous validity and canonical value calculation helper
  const checkValidity = (curLocObj = selectedLocation, curLocTyped = locationTyped, curDestObj = selectedDestination, curDestTyped = destinationTyped) => {
    const locTyped = (curLocTyped || '').trim();
    const locObj = curLocObj;
    const destTyped = (curDestTyped || '').trim();
    const destObj = curDestObj;

    // Location: required field in Roamio.
    // Must have non-empty typed text AND a selected location object matching the typed text.
    const isLocValid = Boolean(
      locObj &&
      typeof locObj.name === 'string' &&
      locTyped.length > 0 &&
      locTyped.toLowerCase() === locObj.name.trim().toLowerCase()
    );

    // Destination: optional discovery field.
    // If empty (or 'Any Destination'), valid discovery mode.
    // If text entered, must match selected destination.
    const isDestEmpty = destTyped.length === 0 || destTyped.toLowerCase() === 'any destination';
    const isDestValid = isDestEmpty || Boolean(
      destObj &&
      typeof destObj.name === 'string' &&
      destObj.name.trim().toLowerCase() !== 'any destination' &&
      destTyped.toLowerCase() === destObj.name.trim().toLowerCase()
    );

    return {
      isLocValid,
      isDestValid,
      canSubmit: isLocValid && isDestValid,
      canonicalLoc: isLocValid ? locObj.name.trim() : null,
      canonicalDest: (isDestValid && !isDestEmpty) ? destObj.name.trim() : null,
    };
  };

  const { isLocValid, isDestValid, canSubmit } = checkValidity();

  // Notify parent of validity state
  React.useEffect(() => {
    if (onValidityChange) {
      onValidityChange(canSubmit);
    }
  }, [canSubmit, onValidityChange]);

  React.useEffect(() => {
    if (!initialValues) return;

    if (initialValues.selectedLocation !== undefined) {
      setSelectedLocation(initialValues.selectedLocation);
    } else if (initialValues.location && typeof initialValues.location === 'string' && initialValues.location.trim()) {
      setSelectedLocation({
        name: initialValues.location.trim(),
        fullName: initialValues.location.trim(),
        coords: null,
      });
    }

    if (initialValues.locationTyped !== undefined) {
      setLocationTyped(initialValues.locationTyped);
    } else if (initialValues.location !== undefined) {
      setLocationTyped(initialValues.location || '');
    }

    if (initialValues.selectedDestination !== undefined) {
      setSelectedDestination(initialValues.selectedDestination);
    } else if (initialValues.destination && typeof initialValues.destination === 'string' && initialValues.destination.trim() && initialValues.destination.toLowerCase() !== 'any destination') {
      setSelectedDestination({
        name: initialValues.destination.trim(),
        fullName: initialValues.destination.trim(),
        coords: null,
      });
    }

    if (initialValues.destinationTyped !== undefined) {
      setDestinationTyped(initialValues.destinationTyped);
    } else if (initialValues.destination !== undefined) {
      const dest = initialValues.destination || '';
      setDestinationTyped(dest.toLowerCase() === 'any destination' ? '' : dest);
    }

    if (initialValues.travellerCount !== undefined) {
      setTravellerCount(initialValues.travellerCount);
      setTravellers(initialValues.travellers || `${initialValues.travellerCount} ${initialValues.travellerCount === 1 ? 'Traveller' : 'Travellers'}`);
    } else if (initialValues.travellers !== undefined) {
      setTravellers(initialValues.travellers);
    }
    if (initialValues.duration !== undefined) setDuration(initialValues.duration);
    if (initialValues.budget !== undefined) setBudget(initialValues.budget);
    if (initialValues.maxTravelTime !== undefined) setMaxTravelTime(initialValues.maxTravelTime);
    if (initialValues.travelMode !== undefined) setTravelMode(initialValues.travelMode);
    if (initialValues.selectedTripTypes !== undefined) {
      setSelectedTripTypes(initialValues.selectedTripTypes);
    } else if (initialValues.tripTypes !== undefined) {
      setSelectedTripTypes(initialValues.tripTypes);
    }
    if (initialValues.accommodationType !== undefined) setAccommodationType(initialValues.accommodationType);
    if (initialValues.crowdLevel !== undefined) setCrowdLevel(initialValues.crowdLevel);
  }, [initialValues]);

  const notifyChange = (overrides = {}) => {
    if (!onChange) return;

    const curLocObj = overrides.selectedLocation !== undefined ? overrides.selectedLocation : selectedLocation;
    const curLocTyped = overrides.locationTyped !== undefined ? overrides.locationTyped : locationTyped;
    const curDestObj = overrides.selectedDestination !== undefined ? overrides.selectedDestination : selectedDestination;
    const curDestTyped = overrides.destinationTyped !== undefined ? overrides.destinationTyped : destinationTyped;

    const { isLocValid: validLoc, isDestValid: validDest, canSubmit: validNow, canonicalLoc, canonicalDest } = checkValidity(
      curLocObj, curLocTyped, curDestObj, curDestTyped
    );

    onChange({
      ...overrides,
      location: canonicalLoc,
      selectedLocation: validLoc ? curLocObj : null,
      locationTyped: curLocTyped,
      destination: canonicalDest,
      selectedDestination: (validDest && canonicalDest) ? curDestObj : null,
      destinationTyped: curDestTyped,
      travellers,
      travellerCount,
      duration,
      budget,
      maxTravelTime,
      travelMode,
      tripTypes: selectedTripTypes,
      accommodationType,
      crowdLevel,
      isValid: validNow,
    });
  };

  const handleLocationTypedChange = (val) => {
    setLocationTyped(val);
    notifyChange({ locationTyped: val, selectedLocation: null });
  };

  const handleLocationSelect = (locObj) => {
    setSelectedLocation(locObj);
    if (locObj) {
      const newName = locObj.name;
      setLocationTyped(newName);
      notifyChange({
        selectedLocation: locObj,
        locationTyped: newName,
      });
    } else {
      notifyChange({
        selectedLocation: null,
      });
    }
  };

  const handleDestinationTypedChange = (val) => {
    setDestinationTyped(val);
    notifyChange({ destinationTyped: val, selectedDestination: null });
  };

  const handleDestinationSelect = (locObj) => {
    setSelectedDestination(locObj);
    if (locObj) {
      const newName = locObj.name;
      setDestinationTyped(newName);
      notifyChange({
        selectedDestination: locObj,
        destinationTyped: newName,
      });
    } else {
      notifyChange({
        selectedDestination: null,
      });
    }
  };

  const updateTravellerCount = (newCount) => {
    const validCount = Math.max(1, Math.min(20, newCount));
    const label = `${validCount} ${validCount === 1 ? 'Traveller' : 'Travellers'}`;
    setTravellerCount(validCount);
    setTravellers(label);
    notifyChange({ travellerCount: validCount, travellers: label });
  };

  const handleTravellerChange = (e) => {
    const rawVal = e.target.value;
    setTravellers(rawVal);
    const parsed = parseInt(rawVal.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      const validCount = Math.max(1, Math.min(20, parsed));
      setTravellerCount(validCount);
      notifyChange({ travellerCount: validCount, travellers: rawVal });
    }
  };

  const handleDurationChange = (newDuration) => {
    const val = Number(newDuration);
    setDuration(val);
    notifyChange({ duration: val });
  };

  const handleTripTypeToggle = (id) => {
    setSelectedTripTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setLocationTyped(DEFAULT_FILTER_STATE.location);
    setSelectedLocation(DEFAULT_FILTER_STATE.selectedLocation);
    setDestinationTyped('');
    setSelectedDestination(null);
    setTravellers(DEFAULT_FILTER_STATE.travellers);
    setTravellerCount(DEFAULT_FILTER_STATE.travellerCount);
    setDuration(DEFAULT_FILTER_STATE.duration);
    setBudget(DEFAULT_FILTER_STATE.budget);
    setMaxTravelTime(DEFAULT_FILTER_STATE.maxTravelTime);
    setTravelMode(DEFAULT_FILTER_STATE.travelMode);
    setSelectedTripTypes(DEFAULT_FILTER_STATE.selectedTripTypes);
    setAccommodationType(DEFAULT_FILTER_STATE.accommodationType);
    setCrowdLevel(DEFAULT_FILTER_STATE.crowdLevel);
    if (onReset) onReset();
  };

  const getFilterValues = () => {
    const { isLocValid: validLoc, isDestValid: validDest, canSubmit: validNow, canonicalLoc, canonicalDest } = checkValidity();
    return {
      location: canonicalLoc,
      selectedLocation: validLoc ? selectedLocation : null,
      locationTyped,
      destination: canonicalDest,
      selectedDestination: (validDest && canonicalDest) ? selectedDestination : null,
      destinationTyped,
      travellers,
      travellerCount,
      duration,
      budget,
      maxTravelTime,
      travelMode,
      tripTypes: selectedTripTypes,
      accommodationType,
      crowdLevel,
      isValid: validNow,
    };
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    if (!canSubmit) {
      console.warn('[RoamioFilters] Submit blocked: selection required for typed location/destination');
      return;
    }
    if (onSubmit) {
      onSubmit(getFilterValues());
    }
  };

  useImperativeHandle(ref, () => ({
    reset: handleReset,
    submit: handleFormSubmit,
    getValues: getFilterValues,
    isValid: () => canSubmit,
  }));

  // Slider progress percentages
  const durationPercent = ((duration - 1) / (14 - 1)) * 100;
  const budgetPercent = (budget / 10000) * 100;

  const containerClasses = layout === 'card'
    ? `bg-white rounded-roamio-3 border border-roamio-border-light p-roamio-5 shadow-2xs space-y-roamio-5 text-left font-roamio-body ${className}`.trim()
    : `space-y-roamio-5 text-left font-roamio-body ${className}`.trim();

  return (
    <div className={containerClasses}>
      {/* Optional Header Row */}
      {showHeader && (
        <div className="flex items-center justify-between pb-roamio-2 border-b border-roamio-divider">
          <h3 className="roamio-h5 text-roamio-text-primary font-bold">
            {title}
          </h3>
          <button
            type="button"
            onClick={handleReset}
            className="roamio-body-xs text-roamio-text-secondary hover:text-roamio-text-primary transition-colors cursor-pointer select-none"
          >
            Reset
          </button>
        </div>
      )}

      {/* 1. YOUR LOCATION */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Your Location
        </h4>
        <LocationAutocompleteInput
          value={locationTyped}
          selectedLocation={selectedLocation}
          onChange={handleLocationTypedChange}
          onSelectLocation={handleLocationSelect}
          iconPosition="right"
          placeholder="Enter city..."
          required={true}
        />
      </section>

      {/* 2. DESTINATION */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Destination
        </h4>
        <LocationAutocompleteInput
          value={destinationTyped}
          selectedLocation={selectedDestination}
          onChange={handleDestinationTypedChange}
          onSelectLocation={handleDestinationSelect}
          iconPosition="right"
          placeholder="Any Destination"
          requireSelection={true}
          helperText={!hasDestinationTyped ? "Leave empty to explore all nearby destinations" : null}
        />
      </section>

      {/* 3. NUMBER OF TRAVELLERS */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Number of Travellers
        </h4>
        <Input
          value={travellers}
          onChange={handleTravellerChange}
          placeholder="2 Travellers"
          className="roamio-body-md text-roamio-text-primary pr-20"
          trailingElement={
            <div className="flex items-center gap-roamio-1">
              <button
                type="button"
                onClick={() => updateTravellerCount(travellerCount - 1)}
                disabled={travellerCount <= 1}
                className="h-7 w-7 rounded-roamio-1 border border-roamio-border-light bg-roamio-bg-secondary hover:bg-white text-roamio-text-primary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition cursor-pointer"
                aria-label="Decrease number of travellers"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateTravellerCount(travellerCount + 1)}
                className="h-7 w-7 rounded-roamio-1 border border-roamio-border-light bg-roamio-bg-secondary hover:bg-white text-roamio-text-primary flex items-center justify-center transition cursor-pointer"
                aria-label="Increase number of travellers"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          }
        />
      </section>

      {/* 4. TRIP DURATION */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-1">
          Trip Duration
        </h4>
        <div className="roamio-body-sm text-roamio-text-primary font-medium">
          {duration} {duration === 1 ? 'Day' : 'Days'}
        </div>
        <Slider
          min={1}
          max={14}
          step={1}
          value={duration}
          onChange={handleDurationChange}
          ariaLabel="Trip duration in days"
        />
      </section>

      {/* 5. BUDGET (PER PERSON) */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-1">
          Budget (Per Person)
        </h4>
        <div className="roamio-body-sm text-roamio-text-primary font-medium">
          ₹ {budget.toLocaleString()}
        </div>
        <Slider
          min={3000}
          max={7000}
          step={500}
          value={budget}
          onChange={(val) => setBudget(val)}
          ariaLabel="Budget per person"
        />
        <div className="flex justify-between items-center text-[11px] text-roamio-text-secondary pt-0.5">
          <span>₹ 3000</span>
          <span>₹ 7000</span>
        </div>
      </section>

      {/* 6. MAX TRAVEL TIME */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Max Travel Time
        </h4>
        <div className="flex flex-wrap gap-roamio-2">
          {MAX_TRAVEL_TIME_OPTIONS.map((time) => (
            <Chip
              key={time}
              variant="filter"
              size="filter"
              radius="1"
              selectedVariant="primary"
              selected={maxTravelTime === time}
              onClick={() => setMaxTravelTime(time)}
            >
              {time}
            </Chip>
          ))}
        </div>
      </section>

      {/* 7. TRAVEL MODE */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Travel mode
        </h4>
        <div className="flex flex-wrap gap-roamio-2">
          {TRAVEL_MODE_OPTIONS.map((mode) => (
            <Chip
              key={mode}
              variant="filter"
              size="filter"
              radius="1"
              selectedVariant="primary"
              selected={travelMode === mode}
              onClick={() => setTravelMode(mode)}
            >
              {mode}
            </Chip>
          ))}
        </div>
      </section>

      {/* 8. TRIP TYPE */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Trip Type
        </h4>
        <div className="grid grid-cols-4 gap-x-2 gap-y-3">
          {TRIP_TYPE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedTripTypes.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTripTypeToggle(item.id)}
                className="p-1 flex flex-col items-center justify-center text-center transition-colors duration-150 cursor-pointer select-none group focus:outline-none"
              >
                <Icon
                  className={`h-6 w-6 mb-1 transition-colors duration-150 ${
                    isSelected ? 'text-roamio-primary-accent' : 'text-roamio-text-tertiary group-hover:text-roamio-text-secondary'
                  }`}
                />
                <span
                  className={`text-xs leading-none transition-colors duration-150 ${
                    isSelected ? 'text-roamio-primary-accent font-semibold' : 'text-roamio-text-tertiary group-hover:text-roamio-text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 9. ACCOMMODATION TYPE */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Accomodation Type
        </h4>
        <div className="flex flex-wrap gap-roamio-2">
          {ACCOMMODATION_OPTIONS.map((acc) => (
            <Chip
              key={acc}
              variant="filter"
              size="filter"
              radius="1"
              selectedVariant="light"
              selected={accommodationType === acc}
              onClick={() => setAccommodationType(acc)}
            >
              {acc}
            </Chip>
          ))}
        </div>
      </section>

      {/* 10. CROWD LEVEL */}
      <section className="space-y-roamio-1.5">
        <h4 className="roamio-h6 text-roamio-text-primary text-sm font-semibold mb-2">
          Crowd Level
        </h4>
        <div className="flex flex-wrap gap-roamio-2">
          {CROWD_LEVEL_OPTIONS.map((level) => (
            <Chip
              key={level}
              variant="filter"
              size="filter"
              radius="1"
              selectedVariant="light"
              selected={crowdLevel === level}
              onClick={() => setCrowdLevel(level)}
            >
              {level}
            </Chip>
          ))}
        </div>
      </section>

      {/* Submit Button */}
      {showSubmit && (
        <div className="pt-roamio-2 space-y-1.5">
          <Button
            type="button"
            variant="primary"
            isFullWidth
            disabled={!canSubmit}
            onClick={handleFormSubmit}
          >
            {submitLabel}
          </Button>
          {!canSubmit && (
            <p className="text-xs text-roamio-semantic-warning text-center font-medium">
              Please select from the dropdown suggestions to search.
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default RoamioFilters;
