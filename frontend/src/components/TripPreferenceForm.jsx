import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Calendar, Wallet, Compass, Sparkles } from 'lucide-react';
import LocationAutocompleteInput from './ui/LocationAutocompleteInput';

export default function TripPreferenceForm({ onSubmit, loading, isRegenerate = false }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startLocation: '',
    startCoords: null,
    destination: '',
    destCoords: null,
    totalDays: 4,
    travelers: 2,
    budget: 25000,
    comfortLevel: 'moderate',
    transportPreference: 'fastest',
    placeTypes: [],
    allowInternationalTransit: false,
  });

  const placeTypeOptions = [
    { id: 'mountains', label: 'Mountains', emoji: '🏔️' },
    { id: 'beaches', label: 'Beaches', emoji: '🏖️' },
    { id: 'temples', label: 'Temples', emoji: '🛕' },
    { id: 'shrines', label: 'Shrines', emoji: '⛩️' },
    { id: 'forests', label: 'Forests', emoji: '🌲' },
    { id: 'historical', label: 'History & Heritage', emoji: '🏛️' },
    { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
    { id: 'food', label: 'Food Exploration', emoji: '🍳' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'spiritual', label: 'Spiritual Travel', emoji: '🧘' },
    { id: 'adventure', label: 'Adventure Activities', emoji: '🧗' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceTypeToggle = (id) => {
    setFormData(prev => {
      const places = prev.placeTypes.includes(id)
        ? prev.placeTypes.filter(p => p !== id)
        : [...prev.placeTypes, id];
      return { ...prev, placeTypes: places };
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Content for each wizard step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <LocationAutocompleteInput
                label="Starting Location"
                required
                placeholder="e.g. Guwahati, Delhi"
                value={formData.startLocation}
                onChange={(val) => handleInputChange('startLocation', val)}
                onSelectLocation={({ name, coords }) => {
                  handleInputChange('startLocation', name);
                  if (coords) handleInputChange('startCoords', coords);
                }}
                icon={MapPin}
              />
              
              <LocationAutocompleteInput
                label="Destination Area"
                required
                placeholder="e.g. Meghalaya, Kerala, Goa"
                value={formData.destination}
                onChange={(val) => handleInputChange('destination', val)}
                onSelectLocation={({ name, coords }) => {
                  handleInputChange('destination', name);
                  if (coords) handleInputChange('destCoords', coords);
                }}
                icon={Compass}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-travel-text-primary mb-2">Duration (Days)</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-travel-text-muted" />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formData.totalDays}
                    onChange={(e) => handleInputChange('totalDays', parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-travel-accent-gray bg-travel-bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-travel-button-dark focus:ring-1 focus:ring-travel-button-dark"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-travel-text-primary mb-2">Number of Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-travel-text-muted" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-travel-accent-gray bg-travel-bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-travel-button-dark focus:ring-1 focus:ring-travel-button-dark"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-travel-text-primary mb-2">
                Total Budget (INR)
              </label>
              <div className="relative">
                <Wallet className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-travel-text-muted" />
                <input
                  type="number"
                  min="2000"
                  step="500"
                  required
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 2000)}
                  className="w-full rounded-xl border border-travel-accent-gray bg-travel-bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-travel-button-dark focus:ring-1 focus:ring-travel-button-dark"
                />
              </div>
              <span className="text-2xs text-travel-text-muted mt-1.5 block">
                Estimated budget for the entire group.
              </span>
            </div>

            {/* Stacked layout, responsive wrapping flex container to prevent overlap */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-travel-text-primary mb-2">Comfort Level</label>
                <div className="flex flex-wrap gap-2.5">
                  {['budget', 'moderate', 'luxury'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleInputChange('comfortLevel', lvl)}
                      className={`flex-1 min-w-[90px] text-center rounded-xl border py-[10px] px-[14px] text-[13px] font-semibold uppercase tracking-wider transition ${
                        formData.comfortLevel === lvl
                          ? 'border-black bg-black text-white shadow-premium'
                          : 'border-travel-accent-gray hover:bg-travel-bg-soft bg-travel-bg-white text-travel-text-muted hover:text-travel-text-primary'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-travel-text-primary mb-2">Transport Preference</label>
                <div className="flex flex-wrap gap-2.5">
                  {['cheapest', 'fastest', 'most comfortable'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handleInputChange('transportPreference', pref)}
                      className={`flex-1 min-w-[90px] text-center rounded-xl border py-[10px] px-[14px] text-[13px] font-semibold uppercase tracking-wider transition ${
                        formData.transportPreference === pref
                          ? 'border-black bg-black text-white shadow-premium'
                          : 'border-travel-accent-gray hover:bg-travel-bg-soft bg-travel-bg-white text-travel-text-muted hover:text-travel-text-primary'
                      }`}
                    >
                      {pref === 'most comfortable' ? 'Comfortable' : pref}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition select-none ${
                  formData.allowInternationalTransit 
                    ? 'border-[#10b981] bg-[#10b981]/5' 
                    : 'border-travel-accent-gray hover:bg-travel-bg-soft/40 bg-travel-bg-white'
                }`}
                onClick={() => handleInputChange('allowInternationalTransit', !formData.allowInternationalTransit)}
              >
                <div className="flex flex-col pr-4 text-left">
                  <span className="text-[13px] font-semibold text-travel-text-primary">Allow International Transit</span>
                  <span className="text-[10px] text-travel-text-muted mt-0.5 leading-normal">Route through neighboring countries if faster (e.g. Bangladesh for North-East India)</span>
                </div>
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${formData.allowInternationalTransit ? 'bg-[#10b981]' : 'bg-[#e5e7eb]'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${formData.allowInternationalTransit ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-travel-text-primary mb-3">
                Select What You Enjoy (Travel Vibes)
              </label>
              
              <div className="flex flex-wrap gap-2.5">
                {placeTypeOptions.map((opt) => {
                  const selected = formData.placeTypes.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePlaceTypeToggle(opt.id)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition active:scale-95 ${
                        selected
                          ? 'border-black bg-black text-white shadow-premium'
                          : 'border-travel-accent-gray bg-travel-bg-white hover:bg-travel-bg-soft text-travel-text-primary hover:text-black hover:border-black'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-travel-accent-gray bg-travel-bg-white p-6 shadow-premium">
      
      {/* Wizard Progress Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-travel-accent-gray text-xs font-bold text-travel-button-dark border border-travel-accent-gray">
            {step}
          </span>
          <span className="text-sm font-bold text-travel-text-primary">
            {step === 1 && "Core Details"}
            {step === 2 && "Budget & Comfort"}
            {step === 3 && "Vibes & Interests"}
          </span>
        </div>
        <span className="text-xs text-travel-text-muted">Step {step} of 3</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-1 w-full rounded-full bg-travel-accent-gray">
        <div 
          className="h-full rounded-full bg-travel-button-dark transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Interactive Wizard Form Container */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Wizard Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-travel-accent-gray pt-5">
        <button
          type="button"
          disabled={step === 1}
          onClick={prevStep}
          className="btn-premium btn-premium-secondary"
        >
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn-premium btn-premium-primary"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="btn-premium btn-premium-primary"
          >
            <Sparkles className="h-4 w-4 text-travel-accent-blue" />
            {loading ? "Designing..." : (isRegenerate ? "Regenerate AI Plan" : "Generate AI Plan")}
          </button>
        )}
      </div>

    </form>
  );
}
