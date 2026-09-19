import React from 'react';
import RoamioFilters from './filters/RoamioFilters';

/**
 * Roamio Filters Panel
 * 
 * Results Dashboard presentation of the shared Roamio Filter System.
 * Consumes the single source of truth (RoamioFilters and filterConfig).
 */
export default function FiltersPanel({
  title = "Filters",
  submitLabel = "Submit",
  isCard = true,
  className = "",
  initialValues,
  onChange,
  onSubmit,
  onReset,
  onValidityChange,
}) {
  return (
    <RoamioFilters
      layout={isCard ? 'card' : 'plain'}
      title={title}
      submitLabel={submitLabel}
      showHeader={true}
      showSubmit={true}
      initialValues={initialValues}
      onChange={onChange}
      onSubmit={onSubmit}
      onReset={onReset}
      onValidityChange={onValidityChange}
      className={className}
    />
  );
}
