import React, { useRef } from 'react';
import Drawer from './ui/Drawer';
import Button from './ui/Button';
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
  const [canSubmit, setCanSubmit] = React.useState(true);

  const handleReset = () => {
    if (filtersRef.current) {
      filtersRef.current.reset();
    }
  };

  const handleSearchTrigger = () => {
    if (!canSubmit) {
      console.warn('[ManualPreferencesDrawer] Search blocked: selection required');
      return;
    }
    if (filtersRef.current) {
      filtersRef.current.submit();
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
      width="w-full sm:w-[380px]"
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
      footerClassName="p-roamio-6 bg-white border-t border-roamio-border-light shrink-0"
      footer={
        <div className="space-y-2">
          <Button
            variant="primary"
            isFullWidth
            disabled={!canSubmit}
            onClick={handleSearchTrigger}
          >
            Search
          </Button>
          {!canSubmit && (
            <p className="text-xs text-roamio-semantic-warning text-center font-medium">
              Please select from the dropdown suggestions to search
            </p>
          )}
        </div>
      }
    >
      <RoamioFilters
        ref={filtersRef}
        layout="plain"
        showHeader={false}
        showSubmit={false}
        initialValues={initialValues}
        onSubmit={handleFiltersSubmit}
        onValidityChange={setCanSubmit}
      />
    </Drawer>
  );
}
