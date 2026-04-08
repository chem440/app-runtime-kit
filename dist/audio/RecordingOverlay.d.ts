interface RecordingOverlayProps {
    isRecording: boolean;
    isWarmingUp?: boolean;
    audioLevel: number;
    voiceActivityThreshold?: number;
    recordingTimeoutSeconds?: number;
    recordingWarningSeconds?: number;
    onRecordingTimeout?: () => void;
    onPause?: () => void;
    onSend?: () => void;
    pauseLabel?: 'Pause' | 'Cancel';
    logger?: (message: string) => void;
}
/**
 * Recording Overlay with Scrolling Waveform
 *
 * Shows a scrolling waveform visualization that accumulates audio level samples
 * over time, similar to iOS Voice Memos. New samples appear on the right and
 * scroll left as recording continues.
 */
export declare function RecordingOverlay({ isRecording, isWarmingUp, audioLevel, voiceActivityThreshold, recordingTimeoutSeconds, recordingWarningSeconds, onRecordingTimeout, onPause, onSend, pauseLabel, logger }: RecordingOverlayProps): import("react/jsx-runtime").JSX.Element | null;
export {};
