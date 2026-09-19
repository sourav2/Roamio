import React from 'react';
import { X, Plus, Check, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import { getExperienceModalData } from '../../data/destinationsData';
import meghalayaImg from '../../assets/images/Meghalaya.jpg';

/**
 * ExperienceDetailModal Component
 * 
 * Reuses the existing Roamio Modal component to display rich details for a selected experience:
 * - Large flush hero image
 * - Floating close button on image with red cross icon
 * - Experience title & subtitle in Fraunces / Inter typography
 * - "+ Add to Trip" button synchronized with currently selected itinerary day
 * - 3-column section: Top Attractions, Experiences, and Pricing / Best Time / Typical Duration
 * - Bottom 5-thumbnail image gallery with "View more →"
 */
export default function ExperienceDetailModal({
  isOpen,
  onClose,
  place,
  destination,
  isAdded = false,
  onAddToTrip,
}) {
  if (!place) return null;

  const modalData = getExperienceModalData(place, destination);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="max-w-3xl"
      bodyClassName="p-0"
      className="max-h-[92vh] overflow-hidden"
    >
      <div className="relative flex flex-col w-full bg-white">
        {/* 1. Large Hero Image with Floating Close Button */}
        <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden bg-roamio-bg-secondary shrink-0">
          <img
            src={modalData.heroImage || meghalayaImg}
            alt={modalData.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = meghalayaImg;
            }}
            className="w-full h-full object-cover"
          />

          {/* Top-Right White Badge Close Button with Red Icon matching Figma */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-roamio-1 bg-white/95 hover:bg-white text-rose-500 hover:text-rose-600 flex items-center justify-center shadow-md transition cursor-pointer select-none"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 2. Scrollable Modal Content */}
        <div className="p-roamio-5 sm:p-roamio-6 space-y-roamio-5 text-left">
          
          {/* Title & Add to Trip Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-roamio-3">
            <div>
              <h2 className="font-roamio-display text-2xl sm:text-3xl font-bold text-roamio-text-primary tracking-tight">
                {modalData.name}
              </h2>
              <p className="roamio-body-xs sm:roamio-body-sm text-roamio-text-secondary mt-1">
                {modalData.description}
              </p>
            </div>

            {/* "+ Add to Trip" Button */}
            <button
              type="button"
              onClick={() => onAddToTrip && onAddToTrip(place)}
              className={`
                shrink-0 px-4 py-2 rounded-roamio-1 border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer select-none
                ${isAdded
                  ? 'border-roamio-btn-light bg-roamio-btn-light/10 text-roamio-btn-light font-semibold'
                  : 'border-roamio-border-light bg-white text-roamio-primary-accent hover:border-roamio-primary-accent hover:bg-roamio-bg-secondary active:scale-95'
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

          {/* 3-Column Experience Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-roamio-4 sm:gap-roamio-6 pt-roamio-1 border-t border-roamio-divider/60 pt-roamio-4">
            
            {/* COLUMN 1: Top Attractions */}
            <div className="md:col-span-5 space-y-2">
              <h3 className="roamio-h6 font-bold text-roamio-text-primary">
                Top Attractions
              </h3>
              <ul className="space-y-2.5">
                {modalData.topAttractions.map((item, idx) => (
                  <li key={idx} className="text-xs">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-roamio-text-secondary font-bold">•</span>
                      <span className="font-semibold text-roamio-text-primary">{item.title}</span>
                    </div>
                    <p className="text-roamio-text-tertiary ml-3 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 2: Experiences */}
            <div className="md:col-span-3 space-y-2">
              <h3 className="roamio-h6 font-bold text-roamio-text-primary">
                Experiences
              </h3>
              <ul className="space-y-1.5">
                {modalData.experiences.map((exp, idx) => (
                  <li key={idx} className="text-xs text-roamio-text-secondary flex items-center gap-1.5">
                    <span className="font-bold text-roamio-text-tertiary">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: Cost, Best Time, Typical Duration */}
            <div className="md:col-span-4 flex flex-col justify-start">
              {/* Estimated Cost */}
              <div>
                <div className="font-roamio-display text-2xl font-bold text-roamio-primary-accent tracking-tight leading-none">
                  {modalData.estimatedCost}
                </div>
                <div className="text-xs text-roamio-text-tertiary mt-1">
                  {modalData.costBasis}
                </div>
              </div>

              {/* Best Time */}
              <div className="mt-4">
                <div className="text-sm font-bold text-roamio-text-primary">
                  Best time
                </div>
                <div className="text-xs text-roamio-text-secondary mt-0.5">
                  {modalData.bestTime}
                </div>
              </div>

              {/* Typical Experience */}
              <div className="mt-4">
                <div className="text-sm font-bold text-roamio-text-primary">
                  Typical experience
                </div>
                <div className="text-xs text-roamio-text-secondary mt-0.5">
                  {modalData.typicalDuration}
                </div>
              </div>
            </div>

          </div>

          {/* 4. Gallery Section */}
          <div className="space-y-2.5 pt-roamio-3 border-t border-roamio-divider/60">
            <div className="flex items-center justify-between">
              <h3 className="roamio-h6 font-bold text-roamio-text-primary">
                Gallery
              </h3>
              <button
                type="button"
                className="text-xs font-semibold text-roamio-primary-accent hover:underline inline-flex items-center gap-1 cursor-pointer select-none"
              >
                <span>View more</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* 5 Thumbnails Row */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {modalData.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="aspect-[4/3] rounded-roamio-2 overflow-hidden bg-roamio-bg-secondary border border-roamio-border-light shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img
                    src={imgUrl}
                    alt={`${modalData.name} gallery ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = meghalayaImg;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
}
