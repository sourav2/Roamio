import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Module-scoped state to track active modal instances across the app
let activeModalCount = 0;

export const lockScroll = () => {
  if (typeof document === 'undefined') return;
  activeModalCount++;
  if (activeModalCount === 1) {
    document.body.style.overflow = 'hidden';
  }
};

export const unlockScroll = () => {
  if (typeof document === 'undefined') return;
  activeModalCount = Math.max(0, activeModalCount - 1);
  if (activeModalCount === 0) {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
};

export const forceUnlockScroll = () => {
  if (typeof document === 'undefined') return;
  activeModalCount = 0;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
};

/**
 * Roamio Modal Component
 * 
 * Strict Roamio Design System implementation:
 * - Card Background: #FFFFFF
 * - Border: Border Light (#DEDEDE), Stroke 1
 * - Radius: Radius 4 (16px)
 * - Elevation: Extra Large Shadow (0px 20px 40px rgba(17,24,39,0.16))
 * - Typography: Fraunces display / Inter body
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg', // 'max-w-md' | 'max-w-lg' | 'max-w-2xl' | 'max-w-4xl'
  showCloseButton = true,
  closeOnBackdropClick = true,
  bodyClassName = 'p-roamio-5',
  zIndex = 'z-[9999]',
  className = '',
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    lockScroll();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockScroll();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-roamio-4`}>
          {/* Overlay with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="absolute inset-0 bg-[#111827]/40 backdrop-blur-xs"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative w-full ${maxWidth} bg-white border border-roamio-border-light rounded-roamio-4 shadow-roamio-xl
              flex flex-col max-h-[90vh] overflow-hidden z-10 font-roamio-body text-roamio-text-primary text-left ${className}
            `.trim()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-roamio-5 border-b border-roamio-divider">
                <div>
                  {title && (
                    <h3 className="font-roamio-display font-semibold text-xl text-roamio-text-primary leading-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-roamio-text-secondary mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-roamio-1 rounded-roamio-1 text-roamio-text-tertiary hover:text-roamio-text-primary hover:bg-roamio-bg-secondary transition cursor-pointer -mr-1"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body (scrollable if content overflows) */}
            <div className={`${bodyClassName} overflow-y-auto flex-1 text-sm leading-[22px] text-roamio-text-primary`}>
              {children}
            </div>

            {/* Footer / Action area */}
            {footer && (
              <div className="p-roamio-5 border-t border-roamio-divider bg-roamio-bg-secondary/40 flex items-center justify-end gap-roamio-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
