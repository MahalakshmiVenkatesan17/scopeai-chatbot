'use client';

import React, { useCallback } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import clsx from 'clsx';

interface VoiceButtonProps {
  /** Called with the final audio Blob when recording stops */
  onAudioReady: (blob: Blob) => Promise<void> | void;
  /** Disable the button entirely (e.g. while AI is typing) */
  disabled?: boolean;
  primaryColor?: string;
  onError?: (msg: string) => void;
}

/** Format elapsed milliseconds as M:SS */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VoiceButton({
  onAudioReady,
  disabled = false,
  primaryColor = '#007bff',
  onError,
}: VoiceButtonProps) {
  const {
    isRecording,
    isProcessing,
    elapsedMs,
    isSupported,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({ maxDurationMs: 60_000, onError });

  const handleClick = useCallback(async () => {
    if (disabled) return;

    if (isRecording) {
      // Stop and hand off the blob
      const blob = await stopRecording();
      if (blob && blob.size > 0) {
        await onAudioReady(blob);
      }
    } else {
      await startRecording();
    }
  }, [disabled, isRecording, startRecording, stopRecording, onAudioReady]);

  // Hide entirely if browser doesn't support MediaRecorder
  if (!isSupported) return null;

  const isActive = isRecording || isProcessing;

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Elapsed time badge — shown while recording */}
      {isRecording && (
        <span
          className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full animate-pulse"
          style={{ color: '#ef4444', background: '#fee2e2' }}
        >
          {formatTime(elapsedMs)}
        </span>
      )}

      {/* Cancel button — shown while recording */}
      {isRecording && (
        <button
          type="button"
          onClick={cancelRecording}
          title="Cancel recording"
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          {/* X icon */}
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Mic / Stop button */}
      <button
        type="button"
        id="voice-record-btn"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title={isRecording ? 'Stop recording' : 'Record voice message'}
        aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
        className={clsx(
          'relative w-10 h-10 rounded-xl flex items-center justify-center',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'shadow-md hover:shadow-lg overflow-hidden',
          isProcessing
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white scale-105 hover:scale-110 active:scale-95'
            : 'text-white hover:scale-110 active:scale-95'
        )}
        style={
          !isProcessing && !isRecording
            ? {
                background: `linear-gradient(135deg, ${primaryColor}cc, ${primaryColor})`,
                boxShadow: `0 4px 12px ${primaryColor}40`,
              }
            : undefined
        }
      >
        {/* Pulse ring while recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-40 pointer-events-none" />
        )}

        {/* Spinner while processing */}
        {isProcessing ? (
          <svg className="w-5 h-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : isRecording ? (
          /* Stop square icon */
          <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Microphone icon */
          <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" fill="currentColor">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" />
            <path d="M19 10a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.93V19H9a1 1 0 000 2h6a1 1 0 000-2h-2v-2.07A7 7 0 0019 10z" />
          </svg>
        )}
      </button>

      {/* Error Tooltip / Badge */}
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-red-600 text-white text-[10px] leading-tight rounded shadow-lg animate-bounce z-50">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Oops!
          </div>
          {error}
        </div>
      )}
    </div>
  );
}
