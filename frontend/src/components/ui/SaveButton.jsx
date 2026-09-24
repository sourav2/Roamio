import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

const SUCCESS_DURATION_MS = 1800;

function isSuccessfulResult(result) {
  return result !== null && result !== false && result?.success !== false;
}

export default function SaveButton({
  onSave,
  label = 'Save Plan',
  component: Component = 'button',
  buttonProps = {},
  className = '',
  disabled = false,
  onSuccess,
  onError,
  idleIcon: IdleIcon,
  ...props
}) {
  const [status, setStatus] = useState('idle');
  const resetTimerRef = useRef(null);

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  const handleSave = async (event) => {
    event?.stopPropagation?.();
    if (status === 'submitting' || disabled || !onSave) return;

    setStatus('submitting');
    try {
      const result = await onSave();
      if (!isSuccessfulResult(result)) {
        throw new Error(result?.message || 'Unable to save the itinerary.');
      }

      setStatus('submitted');
      onSuccess?.(result);
      resetTimerRef.current = setTimeout(() => setStatus('idle'), SUCCESS_DURATION_MS);
    } catch (error) {
      setStatus('idle');
      onError?.(error);
    }
  };

  const content = status === 'submitting' ? (
    <span className="inline-flex items-center gap-2">
      <span>Submitting</span>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
    </span>
  ) : status === 'submitted' ? (
    <span className="inline-flex items-center gap-2">
      <span>Submitted</span>
      <Check className="h-4 w-4" aria-hidden="true" />
    </span>
  ) : (
    <span className="inline-flex items-center gap-2">
      {IdleIcon && <IdleIcon className="h-4 w-4" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );

  return (
    <Component
      {...buttonProps}
      {...props}
      type={buttonProps.type || props.type || 'button'}
      onClick={handleSave}
      disabled={disabled || status === 'submitting'}
      aria-busy={status === 'submitting'}
      className={`${buttonProps.className || ''} ${className}`.trim()}
    >
      {content}
    </Component>
  );
}

export { SUCCESS_DURATION_MS };
