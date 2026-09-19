import React from 'react';
import { Car, Clock, Wallet, CloudSun, Mountain } from 'lucide-react';

/**
 * DestinationInfoCards Component
 * 
 * 5 compact information cards beside the destination map matching Figma reference:
 * 1. Travel Time
 * 2. Trip Duration
 * 3. Budget Avg.
 * 4. Weather
 * 5. Interests
 */
export default function DestinationInfoCards({ destination, className = '' }) {
  if (!destination) return null;

  const cards = [
    {
      id: 'travel-time',
      icon: Car,
      label: 'Travel Time',
      value: destination.travelTime || '11-13 Hours',
    },
    {
      id: 'duration',
      icon: Clock,
      label: 'Trip Duration',
      value: destination.recommendedDuration || '2–3 days recommended',
    },
    {
      id: 'budget',
      icon: Wallet,
      label: 'Budget Avg.',
      value: destination.budget || '₹7,500 est. per person',
    },
    {
      id: 'weather',
      icon: CloudSun,
      label: 'Weather',
      value: destination.weather || 'Cloudy',
    },
    {
      id: 'interests',
      icon: Mountain,
      label: 'Interests',
      value: destination.interests || 'Mountains · Trekking · Tea',
    },
  ];

  return (
    <div className={`flex flex-col justify-between divide-y divide-roamio-border-light h-full py-1 ${className}`.trim()}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`flex flex-col justify-center text-left ${idx === 0 ? 'pb-3' : idx === cards.length - 1 ? 'pt-3' : 'py-3'}`}
          >
            <Icon size={28} className="w-7 h-7 text-roamio-primary-accent mb-1.5 shrink-0" />
            <span className="roamio-body-xs text-roamio-text-tertiary font-medium">
              {card.label}
            </span>
            <span className="roamio-body-sm font-bold text-roamio-text-primary mt-0.5 tracking-tight truncate">
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
