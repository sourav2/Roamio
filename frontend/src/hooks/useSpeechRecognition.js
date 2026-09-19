import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for Web Speech API SpeechRecognition.
 * 
 * Supports seamless continuous dictation across pauses:
 * - Automatically restarts on pause/silence while user intends to listen
 * - Accumulates transcription segments across continuous sessions
 * - Only stops permanently when user explicitly clicks to stop or unrecoverable error occurs
 * - Cleans up on unmount
 */
export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // Detect browser Web Speech API capability
  const isSupported = typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const callbackRef = useRef({ onTranscript: null, onEnd: null });

  // Stop listening permanently (called on explicit user click or explicit trigger)
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // May already be stopped
      }
    }
    if (callbackRef.current.onEnd) {
      callbackRef.current.onEnd();
    }
  }, []);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors on unmount
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Internal helper to create and start a recognition instance
  const createAndStartRecognition = useCallback(() => {
    if (!isSupported || !shouldListenRef.current) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== 'undefined' ? (navigator.language || 'en-US') : 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (shouldListenRef.current) {
          setIsListening(true);
          setError(null);
        }
      };

      recognition.onresult = (event) => {
        let interim = '';
        let currentSessionFinal = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            currentSessionFinal += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        const base = accumulatedTranscriptRef.current;
        const combined = `${base}${currentSessionFinal}${interim}`.trim();

        setTranscript(combined);

        if (callbackRef.current.onTranscript) {
          callbackRef.current.onTranscript(combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[useSpeechRecognition] Recognition error:', event.error);

        // Errors that should permanently stop listening
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          shouldListenRef.current = false;
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone permissions.');
          } else {
            setError('No microphone found. Please ensure a microphone is connected.');
          }
          return;
        }

        // For recoverable errors like 'no-speech' or 'network', do not stop if user still wants to listen
        if (event.error === 'network') {
          setError('Network issue with speech service. Reconnecting...');
        }
      };

      recognition.onend = () => {
        // If user still intends to be listening, automatically restart across pauses!
        if (shouldListenRef.current) {
          setTimeout(() => {
            if (shouldListenRef.current) {
              try {
                recognition.start();
              } catch {
                // If restart on the same instance fails, recreate fresh
                createAndStartRecognition();
              }
            }
          }, 100);
          return;
        }

        setIsListening(false);
        if (callbackRef.current.onEnd) {
          callbackRef.current.onEnd();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[useSpeechRecognition] Failed to initialize SpeechRecognition:', err);
      if (!shouldListenRef.current) {
        setIsListening(false);
        setError('Could not start speech recognition.');
      }
    }
  }, [isSupported]);

  const startListening = useCallback(({ onTranscript, onEnd } = {}) => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop previous instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }

    shouldListenRef.current = true;
    accumulatedTranscriptRef.current = '';
    setError(null);
    setTranscript('');
    callbackRef.current = { onTranscript, onEnd };
    setIsListening(true);

    createAndStartRecognition();
  }, [isSupported, createAndStartRecognition]);

  const toggleListening = useCallback((callbacks) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(callbacks);
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null),
  };
}
