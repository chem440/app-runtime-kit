'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { cn } from '../shared/cn';
// UI-only constants (not shared with VoiceCoachPanel)
const SAMPLE_INTERVAL_MS = 16; // Capture every ~16ms (60fps) for smooth waveform
const DEFAULT_RECORDING_TIMEOUT_SECONDS = 30;
const DEFAULT_RECORDING_WARNING_SECONDS = 10;
const DEFAULT_VOICE_ACTIVITY_THRESHOLD = 10;
/**
 * Recording Overlay with Scrolling Waveform
 *
 * Shows a scrolling waveform visualization that accumulates audio level samples
 * over time, similar to iOS Voice Memos. New samples appear on the right and
 * scroll left as recording continues.
 */
export function RecordingOverlay({ isRecording, isWarmingUp = false, audioLevel, voiceActivityThreshold = DEFAULT_VOICE_ACTIVITY_THRESHOLD, recordingTimeoutSeconds = DEFAULT_RECORDING_TIMEOUT_SECONDS, recordingWarningSeconds = DEFAULT_RECORDING_WARNING_SECONDS, onRecordingTimeout, onPause, onSend, pauseLabel = 'Pause', logger }) {
    const [recordingTime, setRecordingTime] = useState(0);
    const [waveformData, setWaveformData] = useState([]);
    const [voiceDetected, setVoiceDetected] = useState(false);
    const [hasTriggeredTimeout, setHasTriggeredTimeout] = useState(false);
    const canvasRef = useRef(null);
    // Use refs to always get latest values in callbacks (avoid stale closures)
    const audioLevelRef = useRef(audioLevel);
    audioLevelRef.current = audioLevel;
    const onTimeoutRef = useRef(onRecordingTimeout);
    onTimeoutRef.current = onRecordingTimeout;
    const voiceDetectedRef = useRef(voiceDetected);
    voiceDetectedRef.current = voiceDetected;
    // Detect voice activity - once voice is detected, start the countdown
    useEffect(() => {
        if (!isRecording) {
            setVoiceDetected(false);
            return;
        }
        // Check if current audio level exceeds threshold
        if (!voiceDetected && audioLevel >= voiceActivityThreshold) {
            logger?.('[RecordingOverlay] Voice activity detected, starting countdown');
            setVoiceDetected(true);
        }
    }, [isRecording, audioLevel, voiceDetected, voiceActivityThreshold]);
    // Timer effect - only counts up AFTER voice is detected
    useEffect(() => {
        if (!isRecording) {
            setRecordingTime(0);
            setWaveformData([]);
            return;
        }
        // Don't start counting until voice is detected
        if (!voiceDetected) {
            return;
        }
        const interval = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isRecording, voiceDetected]);
    // Auto-stop at 30 seconds (after voice was detected)
    useEffect(() => {
        if (!isRecording || !voiceDetected || hasTriggeredTimeout)
            return;
        if (recordingTime >= recordingTimeoutSeconds) {
            logger?.('[RecordingOverlay] Recording limit reached, auto-sending');
            setHasTriggeredTimeout(true);
            onTimeoutRef.current?.();
        }
    }, [
        isRecording,
        voiceDetected,
        recordingTime,
        hasTriggeredTimeout,
        recordingTimeoutSeconds,
        logger
    ]);
    // Reset hasTriggeredTimeout when recording stops
    useEffect(() => {
        if (!isRecording) {
            setHasTriggeredTimeout(false);
        }
    }, [isRecording]);
    // Accumulate audio level samples using ref for latest value
    // Only capture samples after voice is detected - ignore pre-speech noise
    useEffect(() => {
        if (!isRecording)
            return;
        const interval = setInterval(() => {
            // Only capture samples once voice has been detected
            if (!voiceDetectedRef.current)
                return;
            const currentLevel = audioLevelRef.current;
            setWaveformData(prev => [...prev, currentLevel]);
        }, SAMPLE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isRecording]); // Only depend on isRecording, not audioLevel
    // Draw waveform on canvas - seismograph style (right-anchored, grows left)
    // Uses devicePixelRatio for crisp rendering on high-DPI displays
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Get actual displayed size of canvas
        const rect = canvas.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;
        // Scale canvas for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        // Scale drawing operations so we can use CSS pixel coordinates
        ctx.scale(dpr, dpr);
        // Clear canvas
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        if (waveformData.length === 0)
            return;
        // Canvas width represents the recording timeout window.
        // Fixed scale: canvas width represents MAX_SAMPLES (30s of recording)
        // Each sample has a fixed pixel width - no compression
        const maxSamples = recordingTimeoutSeconds * (1000 / SAMPLE_INTERVAL_MS);
        const barWidth = displayWidth / maxSamples;
        // Auto-normalize: find max level and scale to use full height
        // Audio levels are typically low (average of frequency bins), so we amplify
        const maxLevel = Math.max(...waveformData, 1); // min 1 to avoid division by zero
        const amplification = 100 / maxLevel; // scale so max level = full height
        // Draw from right edge - newest sample at right, oldest at left
        // startX positions the first (oldest) sample so newest lands at right edge
        const startX = displayWidth - waveformData.length * barWidth;
        // Draw bars - white with slight transparency variation based on intensity
        waveformData.forEach((level, i) => {
            // Normalize level relative to max seen, then scale to canvas height
            const normalizedLevel = Math.min(100, level * amplification);
            const barHeight = Math.max(2, (normalizedLevel / 100) * displayHeight);
            const x = startX + i * barWidth;
            const y = (displayHeight - barHeight) / 2; // Center vertically
            // Subtle intensity variation - louder = more opaque
            const alpha = 0.6 + (normalizedLevel / 100) * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, Math.max(barWidth, 1), barHeight);
        });
        // Reset scale for next render
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }, [waveformData, recordingTimeoutSeconds]);
    if (!isRecording) {
        return null;
    }
    // Show countdown (time remaining) after voice detected, otherwise show waiting state
    const remainingTime = recordingTimeoutSeconds - recordingTime;
    const timeDisplay = voiceDetected ? `${remainingTime}` : String(recordingTimeoutSeconds);
    const isNearLimit = voiceDetected && remainingTime <= recordingWarningSeconds;
    const isCritical = voiceDetected && remainingTime <= 5;
    return (_jsx("div", { className: "fixed bottom-[72px] inset-x-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-2xl pointer-events-none z-50", children: _jsxs("div", { className: cn('rounded-lg shadow-lg px-8 py-3 flex items-center gap-3', isWarmingUp
                ? 'bg-slate-700 dark:bg-violet-950'
                : isCritical
                    ? 'bg-pink-700 dark:bg-pink-700'
                    : isNearLimit
                        ? 'bg-sky-500 dark:bg-purple-500'
                        : voiceDetected
                            ? 'bg-sky-600 dark:bg-fuchsia-700'
                            : 'bg-sky-900 dark:bg-fuchsia-900'), children: [_jsxs("div", { className: cn('font-mono font-bold min-w-[56px] text-center rounded-md px-2 py-1', isCritical
                        ? 'text-2xl bg-white/20 text-yellow-200 animate-pulse'
                        : isNearLimit
                            ? 'text-xl bg-white/10 text-yellow-200'
                            : voiceDetected
                                ? 'text-xl text-white'
                                : 'text-lg text-white/70'), children: [timeDisplay, "s"] }), _jsx("div", { className: "flex-1 h-8 overflow-hidden", children: _jsx("canvas", { ref: canvasRef, style: { width: '100%', height: '100%' } }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: cn('size-2 rounded-full shrink-0', isWarmingUp
                                ? 'bg-white/50 animate-spin'
                                : voiceDetected
                                    ? 'bg-white animate-pulse'
                                    : 'bg-white/70 animate-bounce') }), _jsx("span", { className: "text-white text-sm font-medium whitespace-nowrap", children: isWarmingUp
                                ? 'Warming up...'
                                : isCritical
                                    ? 'Sending soon!'
                                    : isNearLimit
                                        ? 'Wrapping up...'
                                        : voiceDetected
                                            ? 'Recording'
                                            : 'Listening...' })] }), (onPause || onSend) && (_jsxs("div", { className: "flex items-center gap-2 pointer-events-auto", children: [onPause && (_jsx("button", { onClick: onPause, className: "px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors", children: pauseLabel })), onSend && (_jsx("button", { onClick: onSend, className: "px-3 py-1.5 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors", children: "Send" }))] }))] }) }));
}
