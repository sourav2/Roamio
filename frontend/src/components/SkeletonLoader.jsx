import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import DashboardSkeleton, {
  TimeoutWarningBanner,
  AISynthesisLoaderCard,
  MetricsSkeleton,
  MapSkeleton,
  DestinationCardsSkeleton,
  MiddleDiscoverySkeleton,
  RightSidePanelSkeleton,
  DestinationMapSkeleton,
  DestinationInfoSkeleton,
  DestinationOverviewSkeleton,
  ExperienceCardsSkeleton,
  DestinationPageSkeleton,
} from './skeleton/DashboardSkeleton';

export {
  DashboardSkeleton,
  TimeoutWarningBanner,
  AISynthesisLoaderCard,
  MetricsSkeleton,
  MapSkeleton,
  DestinationCardsSkeleton,
  MiddleDiscoverySkeleton,
  RightSidePanelSkeleton,
  DestinationMapSkeleton,
  DestinationInfoSkeleton,
  DestinationOverviewSkeleton,
  ExperienceCardsSkeleton,
  DestinationPageSkeleton,
};

const LOADING_MESSAGES = [
  "Finding destinations...",
  "Optimizing route...",
  "Calculating costs...",
  "Creating itinerary...",
  "Generating recommendations...",
  "Preparing travel insights..."
];

export default function SkeletonLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 py-4">
      {/* Dynamic message loader card */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-roamio-primary-accent/20 bg-[#F4FAF7] p-8 text-center shadow-premium max-w-xxl mx-auto">
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-roamio-primary-accent text-white shadow-md">
          <Compass className="h-7 w-7 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <h3 className="text-sm font-bold text-roamio-primary-accent mb-1">Synthesizing Your Custom Trip</h3>
        <p className="text-xs text-roamio-btn-light font-semibold transition-all duration-300 min-h-[1.5rem]">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* 1. TOP SUMMARY CARDS SHIMMER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="bg-white border border-roamio-border-light p-4 rounded-xl shadow-xs space-y-2">
            <div className="h-3 w-1/2 bg-[#DFE5E2] rounded-full roamio-shimmer" />
            <div className="h-5 w-3/4 bg-[#DFE5E2] rounded-full roamio-shimmer" />
            <div className="h-2.5 w-2/3 bg-[#DFE5E2] rounded-full roamio-shimmer" />
          </div>
        ))}
      </div>

      {/* 2. MAP & BUDGET SPLIT SHIMMER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Route Map (8 cols) */}
        <div className="xl:col-span-8 flex flex-col bg-white border border-roamio-border-light rounded-xl p-4 shadow-xs">
          <div className="h-4 w-1/3 bg-[#DFE5E2] rounded-full mb-4 roamio-shimmer" />
          <div className="h-[400px] w-full rounded-roamio-3 roamio-map-shimmer flex items-center justify-center">
            <Compass className="h-10 w-10 text-[#176B53] opacity-25 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Budget Breakdown (4 cols) */}
        <div className="xl:col-span-4 flex flex-col justify-between gap-4">
          <div className="bg-white border border-roamio-border-light rounded-xl p-5 shadow-premium flex-1 flex flex-col gap-4">
            <div className="h-4 w-1/2 bg-[#DFE5E2] rounded-full roamio-shimmer" />
            <div className="flex items-center gap-6 my-auto justify-center py-6">
              <div className="h-28 w-28 rounded-full border-8 border-gray-200 border-t-roamio-primary-accent animate-spin shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-full bg-[#DFE5E2] rounded-full roamio-shimmer" />
                <div className="h-3 w-5/6 bg-[#DFE5E2] rounded-full roamio-shimmer" />
                <div className="h-3 w-4/5 bg-[#DFE5E2] rounded-full roamio-shimmer" />
              </div>
            </div>
            <div className="h-8 w-full bg-[#DFE5E2] rounded-xl roamio-shimmer" />
          </div>
        </div>
      </div>

      {/* 3. SUGGESTED PLACES DISCOVERY SHIMMER (3-column grid) */}
      <div className="space-y-3 pt-2">
        <div className="h-5 w-48 bg-[#DFE5E2] rounded-full mb-3 roamio-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="rounded-xl border border-roamio-border-light bg-white p-4 h-44 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="h-3.5 w-1/3 bg-[#DFE5E2] rounded-full roamio-shimmer" />
                <div className="h-4.5 w-3/4 bg-[#DFE5E2] rounded-full roamio-shimmer" />
                <div className="h-3 w-1/2 bg-[#DFE5E2] rounded-full roamio-shimmer" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="h-3.5 w-1/3 bg-[#DFE5E2] rounded-full roamio-shimmer" />
                <div className="h-7 w-7 rounded-full bg-[#DFE5E2] roamio-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
