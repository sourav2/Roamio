import React from 'react';
import { Compass, MessageSquare } from 'lucide-react';

/**
 * Top Warning Alert Banner when AI synthesis takes longer than usual
 */
export function TimeoutWarningBanner({ onCancel, className = '' }) {
  return (
    <div className={`w-full bg-[#FFF8ED] border border-[#FFE6C2] rounded-roamio-2 p-3 text-left flex items-center justify-between shadow-2xs ${className}`.trim()}>
      <div className="flex items-start gap-2.5 min-w-0 pr-3">
        <MessageSquare className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="roamio-body-xs font-bold text-[#92400E] leading-tight">
            Still working on your Destinations
          </p>
          <p className="text-[11px] text-[#B45309] mt-0.5 leading-snug">
            The AI generation is taking longer than expected. You can wait or cancel and retry.
          </p>
        </div>
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-semibold rounded-roamio-1 shrink-0 transition cursor-pointer shadow-2xs"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

/**
 * Center Column: AI Synthesis Processing Banner
 */
export function AISynthesisLoaderCard({ message = "Finding destinations......", className = '' }) {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-6 bg-[#F4FAF7] border border-[#73C2A6] rounded-roamio-2 text-center shadow-2xs ${className}`.trim()}>
      <div className="relative mb-3 flex h-13 w-13 items-center justify-center rounded-full bg-roamio-primary-accent text-white shadow-md">
        <Compass className="h-6.5 w-6.5 animate-spin" style={{ animationDuration: '4s' }} />
      </div>
      <h3 className="roamio-body-md font-bold text-roamio-primary-accent mb-1">
        Synthesizing Your Custom Trip
      </h3>
      <p className="roamio-body-xs font-semibold text-roamio-btn-light">
        {message}
      </p>
    </div>
  );
}

/**
 * Center Column: 4 Metric Skeleton Blocks
 */
export function MetricsSkeleton({ className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 text-left ${className}`.trim()}>
      {[0, 1, 2, 3].map((idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <div className="h-3 w-16 bg-[#DFE5E2] rounded-full roamio-shimmer" />
          <div className="h-5 w-20 bg-[#DFE5E2] rounded-full roamio-shimmer" />
        </div>
      ))}
    </div>
  );
}

/**
 * Center Column: Map Left-to-Right Shimmer Skeleton
 */
export function MapSkeleton({ className = '' }) {
  return (
    <div className={`relative w-full h-[400px] sm:h-[440px] rounded-roamio-3 overflow-hidden border border-roamio-border-light bg-[#DFE5E2] roamio-map-shimmer ${className}`.trim()}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <Compass className="h-12 w-12 text-[#176B53]" />
      </div>
    </div>
  );
}

/**
 * Center Column: Suggested Destinations 6-Card Grid Skeleton
 */
export function DestinationCardsSkeleton({ count = 6, className = '' }) {
  return (
    <div className={`space-y-roamio-3 text-left pt-roamio-1 ${className}`.trim()}>
      {/* Title skeleton */}
      <div className="h-4 w-36 bg-[#DFE5E2] rounded-full roamio-shimmer mb-2" />

      {/* 3-Column x 2-Row Skeleton Card Grid matching Figma */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-roamio-2">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5E7EB] rounded-roamio-2 p-4 h-[105px] flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-[#DFE5E2] rounded-full roamio-shimmer" />
              <div className="h-4 w-32 bg-[#CBD5E1] rounded-full roamio-shimmer" />
            </div>
            <div className="flex justify-end">
              <div className="w-3.5 h-3.5 rounded-full bg-[#DFE5E2] roamio-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar skeleton */}
      <div className="h-3.5 w-28 bg-[#DFE5E2] rounded-full roamio-shimmer mt-2" />
    </div>
  );
}

/**
 * Center Column: Full Middle Discovery Section Skeleton
 */
export function MiddleDiscoverySkeleton({ className = '' }) {
  return (
    <div className={`flex-1 flex flex-col gap-roamio-4 min-w-0 ${className}`.trim()}>
      <AISynthesisLoaderCard />
      <MetricsSkeleton />
      <MapSkeleton />
      <DestinationCardsSkeleton />
    </div>
  );
}

/**
 * Right Column: Itinerary / Budget Right Side Panel Skeleton matching Figma reference
 */
export function RightSidePanelSkeleton({ className = '' }) {
  return (
    <div className={`w-full lg:w-[360px] xl:w-[380px] shrink-0 bg-white border border-roamio-border-light rounded-roamio-3 p-4 flex flex-col gap-4 shadow-2xs text-left ${className}`.trim()}>
      {/* Top title & subtitle lines */}
      <div className="space-y-2">
        <div className="h-4 w-44 bg-[#DFE5E2] rounded-full roamio-shimmer" />
        <div className="h-5 w-28 bg-[#DFE5E2] rounded-full roamio-shimmer" />
      </div>

      {/* Day selector tabs skeleton */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-7 w-12 bg-[#DFE5E2] rounded-full roamio-shimmer" />
        <div className="h-7 w-12 bg-[#DFE5E2] rounded-full roamio-shimmer" />
        <div className="h-7 w-12 bg-[#DFE5E2] rounded-full roamio-shimmer" />
      </div>

      {/* 5 Sub-filter tag pills */}
      <div className="flex items-center gap-1.5 pt-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 w-8 bg-[#DFE5E2] rounded-full roamio-shimmer" />
        ))}
      </div>

      {/* Selected destination / attraction card skeleton */}
      <div className="border border-[#E5E7EB] rounded-roamio-2 p-3 flex items-center gap-3 bg-[#FAFCFB]">
        <div className="w-14 h-14 bg-[#DFE5E2] rounded-roamio-1 roamio-shimmer shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="h-3 w-32 bg-[#DFE5E2] rounded-full roamio-shimmer" />
          <div className="h-2.5 w-28 bg-[#DFE5E2] rounded-full roamio-shimmer" />
          <div className="h-2 w-20 bg-[#DFE5E2] rounded-full roamio-shimmer" />
        </div>
      </div>

      {/* Bottom budget breakdown skeleton bars */}
      <div className="space-y-2 pt-2">
        <div className="h-6 w-full bg-[#DFE5E2] rounded-full roamio-shimmer" />
        <div className="h-6 w-full bg-[#DFE5E2] rounded-full roamio-shimmer" />
      </div>
    </div>
  );
}

/**
 * Destination Page: Map Left-to-Right Shimmer Skeleton with Synthesis Badge matching Figma
 */
export function DestinationMapSkeleton({ message = "Finding destinations......", className = '' }) {
  return (
    <div className={`relative w-full h-[400px] sm:h-[440px] rounded-roamio-3 overflow-hidden border border-[#73C2A6] bg-[#DFE5E2] roamio-map-shimmer flex flex-col items-center justify-center p-6 text-center shadow-2xs ${className}`.trim()}>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Dashed Compass Icon Badge */}
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#2F9E6F] bg-white/40 shadow-xs">
          <Compass className="h-7 w-7 text-[#176B53] animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h3 className="roamio-body-md sm:text-base font-bold text-[#176B53] mb-1">
          Synthesizing Your Custom Trip
        </h3>
        <p className="roamio-body-xs font-semibold text-[#2F9E6F]">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Destination Page: 4 Info Card Skeleton Column Beside Map matching Figma
 */
export function DestinationInfoSkeleton({ className = '' }) {
  return (
    <div className={`flex flex-col justify-between h-[400px] sm:h-[440px] py-1 text-left ${className}`.trim()}>
      {[0, 1, 2, 3].map((idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <div className="h-3 w-16 bg-[#DFE5E2] rounded-full roamio-shimmer" />
          <div className="h-5 w-20 sm:w-24 bg-[#CBD5E1] rounded-full roamio-shimmer" />
        </div>
      ))}
    </div>
  );
}

/**
 * Destination Page: Overview Section (Map Skeleton + Info Skeletons Grid)
 */
export function DestinationOverviewSkeleton({ className = '' }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-roamio-4 items-stretch ${className}`.trim()}>
      <div className="lg:col-span-8 xl:col-span-8 w-full min-w-0 flex flex-col">
        <DestinationMapSkeleton />
      </div>
      <div className="lg:col-span-4 xl:col-span-4 w-full min-w-0 flex flex-col">
        <DestinationInfoSkeleton />
      </div>
    </div>
  );
}

/**
 * Destination Page: 8 Attraction/Experience Card Grid Skeleton (4 cols x 2 rows) matching Figma
 */
export function ExperienceCardsSkeleton({ count = 8, className = '' }) {
  return (
    <div className={`space-y-roamio-3 text-left pt-2 ${className}`.trim()}>
      {/* Title skeleton bar */}
      <div className="h-4 w-36 bg-[#DFE5E2] rounded-full roamio-shimmer mb-3" />

      {/* 4-Column x 2-Row Skeleton Card Grid matching Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-roamio-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5E7EB] rounded-roamio-2 p-4 h-[120px] sm:h-[130px] flex flex-col justify-between shadow-2xs select-none pointer-events-none"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-[#DFE5E2] rounded-full roamio-shimmer" />
              <div className="h-5 w-32 bg-[#CBD5E1] rounded-full roamio-shimmer" />
            </div>
            <div className="flex justify-end">
              <div className="w-4 h-4 rounded-full bg-[#DFE5E2] roamio-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Roamio Destination Page Skeleton Loader matching Figma reference
 */
export function DestinationPageSkeleton({ onCancel, className = '' }) {
  return (
    <div className={`w-full space-y-4 ${className}`.trim()}>
      {/* Optional Timeout Warning Alert */}
      {onCancel && <TimeoutWarningBanner onCancel={onCancel} />}

      <div className="flex flex-col xl:flex-row gap-roamio-4 items-start w-full">
        {/* Main Destination Skeleton */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-roamio-4">
          <DestinationOverviewSkeleton />
          <ExperienceCardsSkeleton />
        </div>

        {/* Right Itinerary Skeleton */}
        <RightSidePanelSkeleton />
      </div>
    </div>
  );
}

/**
 * Complete Roamio Dashboard Skeleton Loader
 */
export default function DashboardSkeleton({ onCancel, className = '' }) {
  return (
    <div className={`w-full space-y-4 ${className}`.trim()}>
      {/* Optional Timeout Warning Alert */}
      <TimeoutWarningBanner onCancel={onCancel} />

      <div className="flex flex-col lg:flex-row gap-roamio-4 items-start w-full">
        {/* Center Discovery Skeleton */}
        <MiddleDiscoverySkeleton />

        {/* Right Itinerary Skeleton */}
        <RightSidePanelSkeleton />
      </div>
    </div>
  );
}
