import React from 'react';
import { Plus, Check } from 'lucide-react';
import meghalayaImg from '../../assets/images/Meghalaya.jpg';

/**
 * ExperienceCard Component
 * 
 * Renders individual experience/place cards inside the Suggested Destinations grid:
 * - Image banner with top rounded corners (8px)
 * - Place title & description
 * - "+ Add to Trip" button with active/added state feedback
 */
export default function ExperienceCard({
  place,
  isAdded = false,
  onAddToTrip,
  onCardClick,
}) {
  if (!place) return null;

  return (
    <div
      onClick={() => onCardClick && onCardClick(place)}
      className="group bg-white border border-roamio-border-light rounded-roamio-2 overflow-hidden shadow-2xs hover:shadow-roamio-sm flex flex-col justify-between transition-all duration-200 text-left cursor-pointer"
    >
      {/* Top Image Banner */}
      <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-roamio-bg-secondary">
        <img
          src={place.image || meghalayaImg}
          alt={place.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = meghalayaImg;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Content & Action */}
      <div className="px-roamio-3 pt-2.5 pb-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-roamio-text-primary tracking-tight group-hover:text-roamio-primary-accent transition-colors line-clamp-1">
            {place.name}
          </h4>
          <p className="text-xs text-roamio-text-tertiary mt-1 leading-normal line-clamp-2 min-h-[32px]">
            {place.description}
          </p>
        </div>

        {/* Compact "+ Add to Trip" Button at Bottom-Right with Off-White Surface */}
        <div className="flex justify-end items-center mt-3 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToTrip) onAddToTrip(place);
            }}
            className={`
              inline-flex items-center gap-1.5 py-1 px-3 rounded-roamio-1 border text-xs font-medium transition-all duration-150 cursor-pointer select-none
              ${isAdded
                ? 'border-roamio-btn-light bg-roamio-btn-light/10 text-roamio-btn-light font-semibold'
                : 'border-roamio-border-light bg-roamio-bg-secondary text-roamio-primary-accent hover:border-roamio-border-default hover:bg-[#F0ECE2] active:scale-95 shadow-2xs'
              }
            `.trim()}
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Added to Trip</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Add to Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
