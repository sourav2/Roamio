import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Roamio Popover Component
 * 
 * Strict Roamio Design System implementation:
 * - Card Background: #FFFFFF
 * - Border Light: #DEDEDE
 * - Radius: Radius 3 (12px)
 * - Elevation: Medium Drop Shadow (0px 4px 12px rgba(17,24,39,0.08))
 * - Typography: Fraunces / Inter
 * - Spacing: Roamio spacing scale
 */
export default function Popover({
  trigger,
  children,
  placement = 'bottom-start', // 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  isOpen: controlledIsOpen,
  onOpenChange,
  className = '',
}) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const containerRef = useRef(null);

  const toggle = () => {
    const nextState = !isOpen;
    if (!isControlled) setUncontrolledIsOpen(nextState);
    if (onOpenChange) onOpenChange(nextState);
  };

  const close = () => {
    if (!isControlled) setUncontrolledIsOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  // Close on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-roamio-2',
    'bottom-end': 'top-full right-0 mt-roamio-2',
    'top-start': 'bottom-full left-0 mb-roamio-2',
    'top-end': 'bottom-full right-0 mb-roamio-2',
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left font-roamio-body">
      {/* Trigger element */}
      <div onClick={toggle} className="cursor-pointer inline-flex">
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {/* Floating Popover Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`
              absolute z-50 ${placementClasses[placement] || placementClasses['bottom-start']}
              min-w-[200px] bg-roamio-card border border-roamio-border-light rounded-roamio-3 shadow-roamio-md
              p-roamio-4 text-roamio-text-primary ${className}
            `.trim()}
          >
            {typeof children === 'function' ? children({ close }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
