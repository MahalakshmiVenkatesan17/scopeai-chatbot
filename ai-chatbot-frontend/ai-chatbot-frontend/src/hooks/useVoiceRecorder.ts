'use client';

import { useState, useRef, useCallback } from 'react';

export type VoiceRecorderState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceRecorderOptions {
  maxDurationMs?: number;   // Hard cap in ms (default 60 000 = 60 s)
  onError?: (msg: string) => void;
}

interface UseVoiceRecorderReturn {
  state: VoiceRecorderState;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  elapsedMs: number;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  /** The current volume/RMS level (0.0 to 1.0) */
  volume: number;
}

/** 
 * WAV Encoder Utility
 * GPT-4o Audio requires specific formats like WAV/MP3. 
 * This helper ensures the browser produces a clean 16-bit PCM WAV file.
 */
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Convert Float32 to Int16
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export function useVoiceRecorder({
  maxDurationMs = 60_010,
  onError,
}: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [volume, setVolume] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmDataRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const maxVolumeRef = useRef<number>(0);
  const speechFramesRef = useRef<number>(0);

  const isSupported =
    typeof window !== 'undefined' &&
    !!navigator?.mediaDevices?.getUserMedia;

  /** Cleans up stream + timers */
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    scriptProcessorRef.current = null;
    analyserRef.current = null;
    pcmDataRef.current = [];
    setElapsedMs(0);
    setVolume(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const msg = 'Voice recording is not supported in this browser.';
      setError(msg);
      onError?.(msg);
      return;
    }

    try {
      setState('recording');
      setError(null);
      setElapsedMs(0);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      
      // PCM Capture (16kHz Mono)
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      pcmDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmDataRef.current.push(new Float32Array(inputData));
      };

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      maxVolumeRef.current = 0;
      speechFramesRef.current = 0;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Elapsed & Volume timer
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);

        if (analyserRef.current) {
          // 1. RMS Volume Check
          analyserRef.current.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          setVolume(rms);
          if (rms > maxVolumeRef.current) maxVolumeRef.current = rms;

          // 2. Frequency Band VAD Check
          const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(freqData);

          let voiceEnergy = 0;
          let noiseEnergy = 0;

          // At 16kHz, Nyquist is 8000Hz. 128 bins = ~62.5Hz per bin.
          // Human voice range: ~300Hz to 3400Hz -> bins 5 to 54.
          for (let i = 5; i <= 54; i++) {
            voiceEnergy += freqData[i];
          }
          // Noise range: >3400Hz -> bins 55 to 127.
          for (let i = 55; i < freqData.length; i++) {
            noiseEnergy += freqData[i];
          }

          voiceEnergy = voiceEnergy / 50; 
          noiseEnergy = noiseEnergy / (freqData.length - 55);

          // True speech has targeted energy in the voice band, clearly above static noise.
          if (voiceEnergy > 25 && voiceEnergy > noiseEnergy * 1.2) {
            speechFramesRef.current++;
          }
        }

        if (elapsed >= maxDurationMs) {
          stopRecording();
        }
      }, 100);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access.'
          : 'Could not start recording. Please check your microphone.';
      setError(msg);
      onError?.(msg);
      setState('idle');
      cleanup();
    }
  }, [isSupported, maxDurationMs, onError, cleanup]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!audioCtxRef.current) {
        resolve(null);
        return;
      }

      setState('processing');

      // 1. Flatten PCM data
      const totalLength = pcmDataRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
      const flattened = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of pcmDataRef.current) {
        flattened.set(chunk, offset);
        offset += chunk.length;
      }

      // 2. Encode to WAV
      const wavBlob = encodeWAV(flattened, audioCtxRef.current!.sampleRate);

      // 3. Volume and VAD validation
      // Require at least 3 speech frames (~300ms of actual voice activity)
      if (maxVolumeRef.current < 0.02 || speechFramesRef.current < 3) {
        setError('We couldn’t hear you clearly. Please stay closer to the microphone and try again.');
        cleanup();
        setState('idle');
        resolve(null);
      } else {
        cleanup();
        setState('idle');
        resolve(wavBlob);
      }
    });
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    cleanup();
    setState('idle');
    setError(null);
    speechFramesRef.current = 0;
  }, [cleanup]);

  return {
    state,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    error,
    elapsedMs,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    volume,
  };
}
