'use client'

import React, { useEffect, useState, useRef } from 'react'

interface RecordingOverlayProps {
    isRecording: boolean
    isWarmingUp?: boolean // Mic initializing, waiting for first MediaRecorder chunk
    audioLevel: number // 0-100
    voiceActivityThreshold?: number // 0-100, defaults to DEFAULT_VOICE_ACTIVITY_THRESHOLD
    recordingTimeoutSeconds?: number // Defaults to DEFAULT_RECORDING_TIMEOUT_SECONDS
    recordingWarningSeconds?: number // Defaults to DEFAULT_RECORDING_WARNING_SECONDS
    onRecordingTimeout?: () => void // Called when limit is reached
    onPause?: () => void // Called when Pause/Cancel clicked (discard audio)
    onSend?: () => void // Called when Send clicked (transcribe audio)
    pauseLabel?: 'Pause' | 'Cancel' // Default: 'Pause'
    logger?: (message: string) => void // Optional logging hook for host apps
}

// UI-only constants (not shared with VoiceCoachPanel)
const SAMPLE_INTERVAL_MS = 16 // Capture every ~16ms (60fps) for smooth waveform
const DEFAULT_RECORDING_TIMEOUT_SECONDS = 30
const DEFAULT_RECORDING_WARNING_SECONDS = 10
const DEFAULT_VOICE_ACTIVITY_THRESHOLD = 10
const FORCE_RECORDING_FALLBACK_MS = 1500
const STYLE_TAG_ID = 'ark-recording-overlay-styles'

function ensureOverlayStyles(): void {
    if (typeof document === 'undefined') return
    if (document.getElementById(STYLE_TAG_ID)) return

    const style = document.createElement('style')
    style.id = STYLE_TAG_ID
    style.textContent = `
.ark-recording-overlay-root {
  position: fixed;
  bottom: 72px;
  left: 1rem;
  right: 1rem;
  z-index: 50;
  pointer-events: none;
}
@media (min-width: 640px) {
  .ark-recording-overlay-root {
    left: 50%;
    right: auto;
    width: calc(100% - 2rem);
    max-width: 42rem;
    transform: translateX(-50%);
  }
}

.ark-recording-overlay-panel {
  border-radius: var(--ark-recording-radius, 0.5rem);
  box-shadow: var(--ark-recording-shadow, 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1));
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ark-recording-text, #fff);
  background: var(--ark-recording-bg-idle, #0c4a6e);
}
.ark-recording-overlay-panel[data-state='active'] {
  background: var(--ark-recording-bg-active, #0284c7);
}
.ark-recording-overlay-panel[data-state='warning'] {
  background: var(--ark-recording-bg-warning, #0ea5e9);
}
.ark-recording-overlay-panel[data-state='critical'] {
  background: var(--ark-recording-bg-critical, #be185d);
}
.ark-recording-overlay-panel[data-state='warming'] {
  background: var(--ark-recording-bg-warming, #334155);
}
.dark .ark-recording-overlay-panel[data-state='idle'] {
  background: var(--ark-recording-bg-idle-dark, #701a75);
}
.dark .ark-recording-overlay-panel[data-state='active'] {
  background: var(--ark-recording-bg-active-dark, #a21caf);
}
.dark .ark-recording-overlay-panel[data-state='warning'] {
  background: var(--ark-recording-bg-warning-dark, #a855f7);
}
.dark .ark-recording-overlay-panel[data-state='critical'] {
  background: var(--ark-recording-bg-critical-dark, #be185d);
}
.dark .ark-recording-overlay-panel[data-state='warming'] {
  background: var(--ark-recording-bg-warming-dark, #2e1065);
}

.ark-recording-overlay-timer {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-weight: 700;
  min-width: 56px;
  text-align: center;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: var(--ark-recording-text, #fff);
}
.ark-recording-overlay-timer[data-state='idle'] {
  color: var(--ark-recording-timer-idle, rgba(255,255,255,0.7));
}
.ark-recording-overlay-timer[data-state='warning'] {
  color: var(--ark-recording-timer-warning, #fef08a);
  background: var(--ark-recording-timer-warning-bg, rgba(255,255,255,0.1));
}
.ark-recording-overlay-timer[data-state='critical'] {
  font-size: 1.5rem;
  line-height: 2rem;
  color: var(--ark-recording-timer-critical, #fef08a);
  background: var(--ark-recording-timer-critical-bg, rgba(255,255,255,0.2));
  animation: ark-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.ark-recording-overlay-wave {
  flex: 1 1 0%;
  height: 2rem;
  overflow: hidden;
}

.ark-recording-overlay-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ark-recording-overlay-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.7);
}
.ark-recording-overlay-dot[data-state='warming'] {
  background: rgba(255,255,255,0.5);
  animation: ark-spin 1s linear infinite;
}
.ark-recording-overlay-dot[data-state='active'] {
  background: #fff;
  animation: ark-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.ark-recording-overlay-dot[data-state='idle'] {
  animation: ark-bounce 1s infinite;
}

.ark-recording-overlay-label {
  color: var(--ark-recording-text, #fff);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  white-space: nowrap;
}

.ark-recording-overlay-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: auto;
}
.ark-recording-overlay-button {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 0;
  cursor: pointer;
  transition: color 150ms cubic-bezier(0.4,0,0.2,1), background-color 150ms cubic-bezier(0.4,0,0.2,1);
}
.ark-recording-overlay-button:disabled {
  cursor: default;
}
.ark-recording-overlay-button--pause {
  color: var(--ark-recording-button-pause-text, rgba(255,255,255,0.9));
  background: var(--ark-recording-button-pause-bg, rgba(255,255,255,0.1));
}
.ark-recording-overlay-button--pause:hover {
  color: var(--ark-recording-button-pause-text-hover, #fff);
  background: var(--ark-recording-button-pause-bg-hover, rgba(255,255,255,0.2));
}
.ark-recording-overlay-button--send {
  color: var(--ark-recording-button-send-text, #fff);
  background: var(--ark-recording-button-send-bg, rgba(255,255,255,0.2));
}
.ark-recording-overlay-button--send:hover {
  background: var(--ark-recording-button-send-bg-hover, rgba(255,255,255,0.3));
}

@keyframes ark-bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
@keyframes ark-pulse {
  50% { opacity: 0.5; }
}
@keyframes ark-spin {
  to { transform: rotate(360deg); }
}
`

    document.head.appendChild(style)
}

/**
 * Recording Overlay with Scrolling Waveform
 *
 * Self-contained styling: this component injects scoped CSS once at runtime,
 * so host apps do not need to import package stylesheets.
 */
export function RecordingOverlay({
    isRecording,
    isWarmingUp = false,
    audioLevel,
    voiceActivityThreshold = DEFAULT_VOICE_ACTIVITY_THRESHOLD,
    recordingTimeoutSeconds = DEFAULT_RECORDING_TIMEOUT_SECONDS,
    recordingWarningSeconds = DEFAULT_RECORDING_WARNING_SECONDS,
    onRecordingTimeout,
    onPause,
    onSend,
    pauseLabel = 'Pause',
    logger
}: RecordingOverlayProps) {
    const [recordingTime, setRecordingTime] = useState(0)
    const [waveformData, setWaveformData] = useState<number[]>([])
    const [voiceDetected, setVoiceDetected] = useState(false)
    const [hasTriggeredTimeout, setHasTriggeredTimeout] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    // Use refs to always get latest values in callbacks (avoid stale closures)
    const audioLevelRef = useRef(audioLevel)
    audioLevelRef.current = audioLevel
    const onTimeoutRef = useRef(onRecordingTimeout)
    onTimeoutRef.current = onRecordingTimeout
    const voiceDetectedRef = useRef(voiceDetected)
    voiceDetectedRef.current = voiceDetected

    useEffect(() => {
        ensureOverlayStyles()
    }, [])

    // Detect voice activity - once voice is detected, start the countdown
    useEffect(() => {
        if (!isRecording) {
            setVoiceDetected(false)
            return
        }

        // Check if current audio level exceeds threshold
        if (!voiceDetected && audioLevel >= voiceActivityThreshold) {
            logger?.('[RecordingOverlay] Voice activity detected, starting countdown')
            setVoiceDetected(true)
        }
    }, [isRecording, audioLevel, voiceDetected, voiceActivityThreshold, logger])

    // Fallback: if recording is active but analyzer values never cross threshold,
    // force transition so UI/timer doesn't get stuck in "Listening..." forever.
    useEffect(() => {
        if (!isRecording || voiceDetected || isWarmingUp) return

        const timeout = window.setTimeout(() => {
            if (!voiceDetectedRef.current) {
                logger?.('[RecordingOverlay] Forcing recording state after audio threshold timeout')
                setVoiceDetected(true)
            }
        }, FORCE_RECORDING_FALLBACK_MS)

        return () => window.clearTimeout(timeout)
    }, [isRecording, voiceDetected, isWarmingUp, logger])

    // Timer effect - only counts up AFTER voice is detected
    useEffect(() => {
        if (!isRecording) {
            setRecordingTime(0)
            setWaveformData([])
            return
        }

        // Don't start counting until voice is detected
        if (!voiceDetected) {
            return
        }

        const interval = setInterval(() => {
            setRecordingTime(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isRecording, voiceDetected])

    // Auto-stop at 30 seconds (after voice was detected)
    useEffect(() => {
        if (!isRecording || !voiceDetected || hasTriggeredTimeout) return

        if (recordingTime >= recordingTimeoutSeconds) {
            logger?.('[RecordingOverlay] Recording limit reached, auto-sending')
            setHasTriggeredTimeout(true)
            onTimeoutRef.current?.()
        }
    }, [
        isRecording,
        voiceDetected,
        recordingTime,
        hasTriggeredTimeout,
        recordingTimeoutSeconds,
        logger
    ])

    // Reset hasTriggeredTimeout when recording stops
    useEffect(() => {
        if (!isRecording) {
            setHasTriggeredTimeout(false)
        }
    }, [isRecording])

    // Accumulate audio level samples using ref for latest value
    // Only capture samples after voice is detected - ignore pre-speech noise
    useEffect(() => {
        if (!isRecording) return

        const interval = setInterval(() => {
            // Only capture samples once voice has been detected
            if (!voiceDetectedRef.current) return

            const currentLevel = audioLevelRef.current
            setWaveformData(prev => [...prev, currentLevel])
        }, SAMPLE_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [isRecording]) // Only depend on isRecording, not audioLevel

    // Draw waveform on canvas - seismograph style (right-anchored, grows left)
    // Uses devicePixelRatio for crisp rendering on high-DPI displays
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Get actual displayed size of canvas
        const rect = canvas.getBoundingClientRect()
        const displayWidth = rect.width
        const displayHeight = rect.height

        // Scale canvas for high-DPI displays
        const dpr = window.devicePixelRatio || 1
        canvas.width = displayWidth * dpr
        canvas.height = displayHeight * dpr

        // Scale drawing operations so we can use CSS pixel coordinates
        ctx.scale(dpr, dpr)

        // Clear canvas
        ctx.clearRect(0, 0, displayWidth, displayHeight)

        if (waveformData.length === 0) return

        // Canvas width represents the recording timeout window.
        // Fixed scale: canvas width represents MAX_SAMPLES (30s of recording)
        // Each sample has a fixed pixel width - no compression
        const maxSamples = recordingTimeoutSeconds * (1000 / SAMPLE_INTERVAL_MS)
        const barWidth = displayWidth / maxSamples

        // Auto-normalize: find max level and scale to use full height
        // Audio levels are typically low (average of frequency bins), so we amplify
        const maxLevel = Math.max(...waveformData, 1) // min 1 to avoid division by zero
        const amplification = 100 / maxLevel // scale so max level = full height

        // Draw from right edge - newest sample at right, oldest at left
        // startX positions the first (oldest) sample so newest lands at right edge
        const startX = displayWidth - waveformData.length * barWidth

        // Draw bars - white with slight transparency variation based on intensity
        waveformData.forEach((level, i) => {
            // Normalize level relative to max seen, then scale to canvas height
            const normalizedLevel = Math.min(100, level * amplification)
            const barHeight = Math.max(2, (normalizedLevel / 100) * displayHeight)
            const x = startX + i * barWidth
            const y = (displayHeight - barHeight) / 2 // Center vertically

            // Subtle intensity variation - louder = more opaque
            const alpha = 0.6 + (normalizedLevel / 100) * 0.4
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.fillRect(x, y, Math.max(barWidth, 1), barHeight)
        })

        // Reset scale for next render
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }, [waveformData, recordingTimeoutSeconds])

    if (!isRecording) {
        return null
    }

    // Show countdown (time remaining) after voice detected, otherwise show waiting state
    const remainingTime = recordingTimeoutSeconds - recordingTime
    const timeDisplay = voiceDetected ? `${remainingTime}` : String(recordingTimeoutSeconds)
    const isNearLimit = voiceDetected && remainingTime <= recordingWarningSeconds
    const isCritical = voiceDetected && remainingTime <= 5

    let panelState: 'idle' | 'active' | 'warning' | 'critical' | 'warming' = 'idle'
    if (isWarmingUp) panelState = 'warming'
    else if (isCritical) panelState = 'critical'
    else if (isNearLimit) panelState = 'warning'
    else if (voiceDetected) panelState = 'active'

    const timerState: 'idle' | 'warning' | 'critical' =
        isCritical ? 'critical' : isNearLimit ? 'warning' : voiceDetected ? 'warning' : 'idle'

    const dotState: 'idle' | 'active' | 'warming' = isWarmingUp
        ? 'warming'
        : voiceDetected
            ? 'active'
            : 'idle'

    return (
        <div className="ark-recording-overlay-root">
            <div className="ark-recording-overlay-panel" data-state={panelState}>
                <div className="ark-recording-overlay-timer" data-state={timerState}>
                    {timeDisplay}s
                </div>

                <div className="ark-recording-overlay-wave">
                    <canvas
                        ref={canvasRef}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                <div className="ark-recording-overlay-indicator">
                    <div className="ark-recording-overlay-dot" data-state={dotState} />
                    <span className="ark-recording-overlay-label">
                        {isWarmingUp
                            ? 'Warming up...'
                            : isCritical
                                ? 'Sending soon!'
                                : isNearLimit
                                    ? 'Wrapping up...'
                                    : voiceDetected
                                        ? 'Recording'
                                        : 'Listening...'}
                    </span>
                </div>

                {(onPause || onSend) && (
                    <div className="ark-recording-overlay-actions">
                        {onPause && (
                            <button
                                onClick={onPause}
                                className="ark-recording-overlay-button ark-recording-overlay-button--pause"
                            >
                                {pauseLabel}
                            </button>
                        )}
                        {onSend && (
                            <button
                                onClick={onSend}
                                className="ark-recording-overlay-button ark-recording-overlay-button--send"
                            >
                                Send
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
