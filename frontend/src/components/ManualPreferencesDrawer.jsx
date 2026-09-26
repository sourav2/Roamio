import React, { useRef } from 'react';
import Drawer from './ui/Drawer';
import RoamioFilters from './filters/RoamioFilters';

/**
 * Roamio Manual Preferences Drawer Component
 * 
 * Home Page slide-over presentation of the shared Roamio Filter System.
 * Consumes the single source of truth (RoamioFilters and filterConfig).
 */
export default function ManualPreferencesDrawer({
  isOpen,
  onClose,
  onSearch,
  initialValues,
}) {
  const filtersRef = useRef(null);
  const [, setCanSubmit] = React.useState(true);

  const handleReset = () => {
    if (filtersRef.current) {
      filtersRef.current.reset();
    }
  };

  const handleFiltersSubmit = (filterValues) => {
    if (onSearch) {
      onSearch(filterValues);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      width="w-full sm:w-[400px]"
      showCloseButton={false}
      header={
        <div className="flex items-center justify-between px-roamio-6 py-roamio-5 border-b border-roamio-divider bg-white shrink-0">
          <h3 className="roamio-h5 text-roamio-text-primary font-bold">
            Set preferences
          </h3>
          <button
            type="button"
            onClick={handleReset}
            className="roamio-body-xs text-roamio-text-secondary hover:text-roamio-text-primary transition-colors cursor-pointer select-none"
          >
            Reset
          </button>
        </div>
      }
      bodyClassName="px-roamio-6 py-roamio-5 bg-white"
    >
      <RoamioFilters
        ref={filtersRef}
        layout="plain"
        showHeader={false}
        showSubmit={true}
        submitLabel="Find Destination"
        initialValues={initialValues}
        onSubmit={handleFiltersSubmit}
        onValidityChange={setCanSubmit}
      />
    </Drawer>
  );
}
