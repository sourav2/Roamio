import React, { useState } from 'react';
import { Plus, X, Sparkles, MessageSquare } from 'lucide-react';
import Button from './ui/Button';
import meghalayaImg from '../assets/images/Meghalaya.jpg';
import { calculateItineraryTotals, calculateDynamicBudgetCategories } from '../data/destinationsData';

/**
 * Demo Destinations Data by Day
 */
const initialDayDestinations = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
};

/**
 * Donut Chart Component using pure SVG and Roamio Tokens
 */
function BudgetDonutChart({ total = '₹0', categories = [] }) {
  const size = 180;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const isZero = !categories.some((c) => c.amount > 0);

  let currentAngle = -90; // Start at top

  return (
    <div className="relative flex items-center justify-center mx-auto my-roamio-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {isZero ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
        ) : (
          categories.map((cat) => {
            if (!cat.percentage || cat.percentage <= 0) return null;
            const strokeDasharray = (cat.percentage / 100) * circumference;
            const strokeDashoffset = -((currentAngle + 90) / 360) * circumference;
            currentAngle += (cat.percentage / 100) * 360;

            return (
              <circle
                key={cat.name}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })
        )}
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="roamio-body-xs text-roamio-text-secondary font-medium">
          Total Est.
        </span>
        <span className="roamio-h5 font-bold text-roamio-text-primary tracking-tight mt-0.5">
          {total}
        </span>
      </div>
    </div>
  );
}

/**
 * Roamio Right-Side Itinerary / Budget Module
 * 
 * Strict Roamio Design System Implementation:
 * - View Switcher: Capsule pill toggling between "Itinerary" and "Budget Breakdown"
 * - Itinerary View:
 *   - Trip summary cards (Days: 5, Cost: ₹3000, Total Time: 3 H)
 *   - Dynamic Day Selector (Day 1 - Day N based on tripDuration)
 *   - Selected day utilizes Light Button token (#46B392)
 *   - Destination list belonging to individual days (Tiger Hill card)
 *   - "Add more Destinations" & "Review Plan" (Primary Accent #164A3A)
 * - Budget Breakdown View:
 *   - Circular Donut Chart with total estimate & 4 categories
 *   - Itemized legend breakdown
 *   - "View Breakdown" button (Primary Accent #164A3A)
 *   - AI Recommendations card
 */
export default function RightSidePanel({
  tripDuration = 5,
  travellerCount = 1,
  initialView = 'itinerary', // 'itinerary' | 'budget'
  className = '',
  onReviewPlan,
  onViewBreakdown,
  onAddMoreDestinations,
  selectedDay: controlledSelectedDay,
  onSelectDay,
  destinationsByDay: controlledDestinationsByDay,
  onRemoveDestination: controlledOnRemoveDestination,
}) {
  const [activeView, setActiveView] = useState(initialView);
  const [internalSelectedDay, setInternalSelectedDay] = useState(1);
  const [internalDestinationsByDay, setInternalDestinationsByDay] = useState(initialDayDestinations);

  const selectedDay = controlledSelectedDay !== undefined ? controlledSelectedDay : internalSelectedDay;
  const handleSelectDay = (day) => {
    if (onSelectDay) onSelectDay(day);
    setInternalSelectedDay(day);
  };

  const destinationsByDay = controlledDestinationsByDay !== undefined ? controlledDestinationsByDay : internalDestinationsByDay;

  // Dynamically generate day numbers based on tripDuration
  const days = Array.from({ length: Math.max(1, tripDuration) }, (_, i) => i + 1);

  // Clamp selectedDay to tripDuration when tripDuration changes
  React.useEffect(() => {
    if (selectedDay > tripDuration) {
      handleSelectDay(Math.max(1, tripDuration));
    }
  }, [tripDuration, selectedDay]);

  const handleRemoveDestination = (day, destId) => {
    if (controlledOnRemoveDestination) {
      controlledOnRemoveDestination(day, destId);
    }
    setInternalDestinationsByDay((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((d) => d.id !== destId),
    }));
  };

  const currentDayDestinations = destinationsByDay[selectedDay] || [];
  const { cost, totalTime } = calculateItineraryTotals(destinationsByDay, travellerCount);
  const dynamicBudget = calculateDynamicBudgetCategories(destinationsByDay, travellerCount);

  return (
    <aside className={`w-full max-w-[400px] flex flex-col gap-roamio-4 font-roamio-body text-left ${className}`.trim()}>

      {/* 1. TOP VIEW SWITCHER */}
      <div className="flex justify-center w-full">
        <div className="inline-flex p-0.5 bg-roamio-bg-secondary rounded-roamio-1 border border-roamio-border-light shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveView('itinerary')}
            className={`
              px-roamio-4 py-1.5 rounded-roamio-1 text-xs font-semibold transition-all duration-150 cursor-pointer
              ${activeView === 'itinerary'
                ? 'bg-roamio-text-primary text-white shadow-roamio-xs'
                : 'text-roamio-text-secondary hover:text-roamio-text-primary'
              }
            `.trim()}
          >
            Itinerary
          </button>
          <button
            type="button"
            onClick={() => setActiveView('budget')}
            className={`
              px-roamio-4 py-1.5 rounded-roamio-1 text-xs font-semibold transition-all duration-150 cursor-pointer
              ${activeView === 'budget'
                ? 'bg-roamio-text-primary text-white shadow-roamio-xs'
                : 'text-roamio-text-secondary hover:text-roamio-text-primary'
              }
            `.trim()}
          >
            Budget Breakdown
          </button>
        </div>
      </div>

      {/* 2. ITINERARY VIEW */}
      {activeView === 'itinerary' && (
        <div className="space-y-roamio-4">

          {/* Header */}
          <h3 className="roamio-h6 font-semibold text-roamio-text-primary">
            Select the Day to add the destination
          </h3>

          {/* Trip Summary Metrics (Days, Cost, Total Time) */}
          <div className="grid grid-cols-3 gap-roamio-2">
            <div className="bg-roamio-accent-secondary-10 border border-roamio-border-light rounded-roamio-1 p-roamio-2 text-left">
              <span className="block text-[11px] font-medium text-roamio-text-secondary uppercase tracking-wider">
                Days
              </span>
              <span className="roamio-h6 font-bold text-roamio-text-primary mt-0.5 block">
                {tripDuration}
              </span>
            </div>

            <div className="bg-roamio-accent-secondary-10 border border-roamio-border-light rounded-roamio-1 p-roamio-2 text-left">
              <span className="block text-[11px] font-medium text-roamio-text-secondary uppercase tracking-wider">
                Cost
              </span>
              <span className="roamio-h6 font-bold text-roamio-text-primary mt-0.5 block">
                {cost}
              </span>
            </div>

            <div className="bg-roamio-accent-secondary-10 border border-roamio-border-light rounded-roamio-1 p-roamio-2 text-left">
              <span className="block text-[11px] font-medium text-roamio-text-secondary uppercase tracking-wider">
                Total Time
              </span>
              <span className="roamio-h6 font-bold text-roamio-text-primary mt-0.5 block">
                {totalTime}
              </span>
            </div>
          </div>

          {/* Dynamic Day Selector (Uses Primary Accent #164A3A for selected day, compact 4px radius, wraps at max 5 per row) */}
          <div className="grid grid-cols-5 gap-roamio-2 w-full">
            {days.map((d) => {
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  style={{
                    backgroundColor: isSelected ? 'var(--roamio-primary-accent)' : '#FFFFFF',
                    borderColor: isSelected ? 'var(--roamio-primary-accent)' : 'var(--roamio-border-light)',
                  }}
                  className={`
                    w-full text-center py-1.5 px-1 rounded-roamio-1 text-xs font-semibold transition-all duration-150 cursor-pointer select-none border
                    ${isSelected
                      ? 'text-white shadow-roamio-xs'
                      : 'text-roamio-text-secondary hover:text-roamio-text-primary hover:border-roamio-border-strong'
                    }
                  `.trim()}
                >
                  Day {d}
                </button>
              );
            })}
          </div>

          {/* Selected Day Destinations List */}
          <div className="space-y-roamio-3 pt-roamio-1">
            {currentDayDestinations.length > 0 ? (
              currentDayDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white border border-roamio-border-light rounded-roamio-2 p-roamio-3 flex items-center justify-between gap-roamio-3 shadow-roamio-sm hover:shadow-roamio-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-roamio-3 min-w-0">
                    <img
                      src={dest.image || meghalayaImg}
                      alt={dest.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = meghalayaImg;
                      }}
                      className="w-16 h-16 rounded-roamio-2 object-cover shrink-0 border border-roamio-border-light/50"
                    />
                    <div className="min-w-0 text-left">
                      <h4 className="roamio-body-md font-bold text-roamio-text-primary truncate">
                        {dest.name}
                      </h4>
                      <p className="text-xs text-roamio-text-secondary truncate mt-0.5">
                        {dest.subtitle}
                      </p>
                      <p className="text-xs font-bold text-roamio-primary-accent mt-1">
                        {dest.timeAndCost}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDestination(selectedDay, dest.id)}
                    className="p-1.5 rounded-roamio-1 text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer shrink-0"
                    aria-label={`Remove ${dest.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-roamio-6 px-roamio-4 text-center text-xs text-roamio-text-tertiary border border-dashed border-roamio-border-light rounded-roamio-2 bg-roamio-bg-secondary/20">
                No destinations added for Day {selectedDay}. Click below to add destinations.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-roamio-2 pt-roamio-2">
            <Button
              variant="outline"
              isFullWidth
              icon={Plus}
              onClick={onAddMoreDestinations}
              className="!bg-roamio-accent-secondary-10 hover:!bg-roamio-accent-secondary-10 bg-roamio-accent-secondary-10"
            >
              Add more Destinations
            </Button>

            <Button
              variant="primary"
              isFullWidth
              onClick={onReviewPlan}
            >
              Review Plan
            </Button>
          </div>

        </div>
      )}

      {/* 3. BUDGET BREAKDOWN VIEW */}
      {activeView === 'budget' && (
        <div className="space-y-roamio-4">

          {/* Main Budget Section (Unboxed / flat container) */}
          <div className="space-y-roamio-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="roamio-h6 font-bold text-roamio-text-primary">
                Budget Breakdown
              </h3>
              <span className="h-2.5 w-2.5 rounded-full bg-roamio-primary-accent" />
            </div>

            {/* Circular Donut Chart */}
            <BudgetDonutChart total={dynamicBudget.totalFormatted} categories={dynamicBudget.categories} />

            {/* Category Breakdown Legend */}
            <div className="space-y-roamio-2.5 pt-roamio-2 text-sm">
              {dynamicBudget.categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="roamio-body-sm font-medium text-roamio-text-primary">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-roamio-body">
                    <span className="font-bold text-roamio-text-primary text-sm">
                      ₹ {cat.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-roamio-text-tertiary">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* View Breakdown Button */}
            <div className="pt-roamio-2">
              <Button
                variant="primary"
                isFullWidth
                onClick={onViewBreakdown}
              >
                View Breakdown
              </Button>
            </div>

          </div>

          {/* AI Recommendations Section (Unboxed / Flat within panel hierarchy) */}
          <div className="space-y-roamio-3 text-left pt-2 border-t border-roamio-border-light">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-roamio-btn-light" />
              <h4 className="roamio-h6 font-bold text-roamio-text-primary">
                AI Recommendations
              </h4>
            </div>

            <div className="space-y-roamio-2.5">
              <div className="flex items-start gap-2.5 text-left">
                <MessageSquare className="h-4 w-4 text-[#EBBA58] shrink-0 mt-0.5" />
                <p className="text-xs text-roamio-text-secondary leading-relaxed">
                  {dynamicBudget.totalAmount === 0
                    ? 'Add destinations to your itinerary to generate intelligent AI budget optimization insights.'
                    : 'Optimized for your selected comfort level. Consider local transit passes to save on Transport.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5 text-left">
                <MessageSquare className="h-4 w-4 text-[#EBBA58] shrink-0 mt-0.5" />
                <p className="text-xs text-roamio-text-secondary leading-relaxed">
                  {dynamicBudget.totalAmount === 0
                    ? 'Your itinerary automatically tracks and balances travel time, activities, stay, and food.'
                    : `Estimated average daily expense: ₹${Math.round(dynamicBudget.totalAmount / (dynamicBudget.activeDaysCount || 1)).toLocaleString('en-IN')} per day.`}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </aside>
  );
}
