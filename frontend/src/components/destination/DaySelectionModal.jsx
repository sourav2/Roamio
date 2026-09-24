import React from 'react';
import { Plus, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SaveButton from '../ui/SaveButton';
import meghalayaImg from '../../assets/images/Meghalaya.jpg';
import { calculateItineraryTotals } from '../../data/destinationsData';

/**
 * DaySelectionModal Component
 * 
 * Reusable modal for "Select the Day to add the destination":
 * - Exact visual and structural parity with RightSidePanel's itinerary view
 * - Dynamic Summary: Days, Cost, and Total Time automatically calculated across itinerary items
 * - Day selector: Day 1 - Day N based on tripDuration (4px radius, Primary Accent selected)
 * - Added itinerary item cards with pure white surface, subtle shadow & hover lift
 * - "+ Add more Destinations" and active/disabled "Save Plan" using Roamio Button component
 */
export default function DaySelectionModal({
  isOpen,
  onClose,
  place,
  tripDuration = 5,
  travellerCount = 1,
  selectedDay: controlledSelectedDay,
  onSelectDay,
  destinationsByDay = {},
  onAddDestination,
  onRemoveDestination,
  onReviewPlan,
  onAddMoreDestinations,
}) {
  // Generate days array dynamically from tripDuration
  const days = Array.from({ length: Math.max(1, tripDuration) }, (_, i) => i + 1);

  // Local state for day selection in modal (null for initial state before a day is picked)
  const [localSelectedDay, setLocalSelectedDay] = React.useState(null);

  // When modal opens or place changes, check if place is already added to any day
  React.useEffect(() => {
    if (!isOpen || !place) {
      setLocalSelectedDay(null);
      return;
    }
    // Find if place is already in any day
    let foundDay = null;
    for (const d of days) {
      if ((destinationsByDay[d] || []).some((i) => i.id === place.id)) {
        foundDay = d;
        break;
      }
    }
    setLocalSelectedDay(foundDay);
  }, [isOpen, place?.id]);

  const activeDay = localSelectedDay;
  const currentDayItems = activeDay ? (destinationsByDay[activeDay] || []) : [];
  const hasItems = currentDayItems.length > 0;

  // Dynamic itinerary totals across all days (factoring in travellerCount)
  const { cost, totalTime } = calculateItineraryTotals(destinationsByDay, travellerCount);

  // Handle selecting a day
  const handleDayClick = (dayNumber) => {
    setLocalSelectedDay(dayNumber);
    if (onSelectDay) onSelectDay(dayNumber);

    // Check if place is already in ANY day
    const alreadyInAnyDay = days.some((d) =>
      (destinationsByDay[d] || []).some((i) => i.id === place?.id)
    );

    if (!alreadyInAnyDay && place && onAddDestination) {
      onAddDestination(dayNumber, place);
    }
  };

  const handleRemove = (dayNumber, itemId) => {
    if (onRemoveDestination) {
      onRemoveDestination(dayNumber, itemId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="max-w-[420px]"
      zIndex="z-[10010]"
      bodyClassName="p-roamio-5"
      className="overflow-hidden shadow-roamio-xl"
    >
      <div className="space-y-roamio-4 font-roamio-body text-roamio-text-primary text-left">
        
        {/* 1. Modal Heading */}
        <h3 className="roamio-h6 font-semibold text-roamio-text-primary">
          Select the Day to add the destination
        </h3>

        {/* 2. Trip Summary Metrics (Days, Cost, Total Time) */}
        <div className="grid grid-cols-3 gap-roamio-2">
          {/* Days */}
          <div className="bg-roamio-accent-secondary-10 border border-roamio-border-light rounded-roamio-1 p-roamio-2 text-left">
            <span className="block text-[11px] font-medium text-roamio-text-secondary uppercase tracking-wider">
              Days
            </span>
            <span className="roamio-h6 font-bold text-roamio-text-primary mt-0.5 block">
              {tripDuration}
            </span>
          </div>

          {/* Cost */}
          <div className="bg-roamio-accent-secondary-10 border border-roamio-border-light rounded-roamio-1 p-roamio-2 text-left">
            <span className="block text-[11px] font-medium text-roamio-text-secondary uppercase tracking-wider">
              Cost
            </span>
            <span className="roamio-h6 font-bold text-roamio-text-primary mt-0.5 block">
              {cost}
            </span>
          </div>

          {/* Total Time */}
          <div className="bg-roamio-accent-secondary-10 border border-roamio-border-light rounded-roamio-1 p-roamio-2 text-left">
            <span className="block text-[11px] font-medium text-roamio-text-secondary uppercase tracking-wider">
              Total Time
            </span>
            <span className="roamio-h6 font-bold text-roamio-text-primary mt-0.5 block">
              {totalTime}
            </span>
          </div>
        </div>

        {/* 3. Dynamic Day Selector (Uses semantic light green token #46B392 for selected day, 14px Inter Medium typography, compact 4px radius) */}
        <div className="grid grid-cols-5 gap-roamio-2 w-full">
          {days.map((d) => {
            const isSelected = activeDay === d && hasItems;
            return (
              <button
                key={d}
                type="button"
                onClick={() => handleDayClick(d)}
                className={`
                  w-full text-center py-1.5 px-1 rounded-roamio-1 roamio-body-sm-medium transition-all duration-150 cursor-pointer select-none border
                  ${isSelected
                    ? 'bg-roamio-btn-light border-roamio-btn-light text-white shadow-roamio-xs'
                    : 'bg-white border-roamio-primary-accent text-roamio-primary-accent hover:bg-roamio-primary-accent/5'
                  }
                `.trim()}
              >
                Day {d}
              </button>
            );
          })}
        </div>

        {/* 4. Added Itinerary Cards / Empty State */}
        <div className="space-y-roamio-3 pt-roamio-1">
          {activeDay ? (
            hasItems ? (
              currentDayItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-roamio-border-light rounded-roamio-2 p-roamio-3 flex items-center justify-between gap-roamio-3 shadow-roamio-sm hover:shadow-roamio-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-roamio-3 min-w-0">
                    <img
                      src={item.image || meghalayaImg}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = meghalayaImg;
                      }}
                      className="w-16 h-16 rounded-roamio-2 object-cover shrink-0 border border-roamio-border-light/50"
                    />
                    <div className="min-w-0 text-left">
                      <h4 className="roamio-body-md-medium text-roamio-text-primary truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-roamio-text-secondary truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-xs font-bold text-roamio-primary-accent mt-1">
                        {item.timeAndCost}
                      </p>
                    </div>
                  </div>

                  {/* Remove Action */}
                  <button
                    type="button"
                    onClick={() => handleRemove(activeDay, item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="p-1.5 rounded-roamio-1 text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-roamio-6 px-roamio-4 text-center text-xs text-roamio-text-tertiary border border-dashed border-roamio-border-light rounded-roamio-2 bg-roamio-bg-secondary/20">
                No destinations added for Day {activeDay}. Click a Day above to add destinations.
              </div>
            )
          ) : (
            <div className="py-roamio-6 px-roamio-4 text-center text-xs text-roamio-text-tertiary border border-dashed border-roamio-border-light rounded-roamio-2 bg-roamio-bg-secondary/20">
              Click a Day above to add {place?.name || 'this destination'}.
            </div>
          )}
        </div>

        {/* 5. Action Buttons (Reusing Roamio Button component matching RightSidePanel) */}
        <div className="space-y-roamio-2 pt-roamio-2">
          <Button
            variant="outline"
            isFullWidth
            icon={Plus}
            onClick={() => {
              if (onAddMoreDestinations) onAddMoreDestinations();
              if (onClose) onClose();
            }}
            className="!bg-roamio-accent-secondary-10 hover:!bg-roamio-accent-secondary-10 bg-roamio-accent-secondary-10"
          >
            Add more Destinations
          </Button>

          <SaveButton
            component={Button}
            buttonProps={{ variant: 'primary', isFullWidth: true }}
            label="Save Plan"
            disabled={!hasItems}
            onSave={() => onReviewPlan?.()}
          />
        </div>

      </div>
    </Modal>
  );
}

