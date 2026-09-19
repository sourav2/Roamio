import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { lockScroll, unlockScroll } from './Modal';

/**
 * Roamio Drawer Component (Slide-Over Panel)
 * 
 * Strict Roamio Design System implementation:
 * - Card Background: #FFFFFF
 * - Border: Border Light (#DEDEDE), Stroke 1
 * - Radius: Radius 4 (16px) on inner edge
 * - Elevation: Extra Large Shadow (0px 20px 40px rgba(17,24,39,0.16))
 * - Typography: Fraunces display / Inter body
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  header,
  headerAction,
  titleClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  placement = 'right', // 'left' | 'right'
  width = 'w-80 sm:w-96', // customizable width class
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Lock body scroll and listen for Escape key on open
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unlockScroll();
    };
  }, [isOpen]);

  const isLeft = placement === 'left';

  const slideVariants = {
    closed: {
      x: isLeft ? '-100%' : '100%',
      transition: { type: 'spring', damping: 28, stiffness: 260 }
    },
    open: {
      x: 0,
      transition: { type: 'spring', damping: 28, stiffness: 260 }
    }
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex select-none font-roamio-body">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-[#111827]/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={slideVariants}
            className={`
              fixed inset-y-0 ${isLeft ? 'left-0 border-r' : 'right-0 border-l'}
              ${width} bg-roamio-bg-app border-roamio-border-light shadow-roamio-xl
              flex flex-col z-10 select-text overflow-hidden text-left ${className}
            `.trim()}
          >
            {/* Header */}
            {header ? (
              header
            ) : (title || showCloseButton || headerAction) ? (
              <div className={`flex items-center justify-between p-roamio-5 border-b border-roamio-divider shrink-0 ${headerClassName}`.trim()}>
                <div>
                  {title && (
                    <h3 className={titleClassName || "font-roamio-display font-semibold text-lg text-roamio-text-primary leading-tight"}>
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-roamio-text-secondary mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>

                {headerAction ? (
                  headerAction
                ) : showCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-roamio-1 rounded-roamio-1 text-roamio-text-tertiary hover:text-roamio-text-primary hover:bg-roamio-bg-secondary transition cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* Scrollable Content Body */}
            <div className={`flex-1 overflow-y-auto p-roamio-5 space-y-roamio-4 ${bodyClassName}`.trim()}>
              {children}
            </div>

            {/* Sticky Footer */}
            {footer && (
              <div className={`p-roamio-5 shrink-0 ${footerClassName || 'border-t border-roamio-divider bg-roamio-bg-secondary/40'}`.trim()}>
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawerContent, document.body);
}
