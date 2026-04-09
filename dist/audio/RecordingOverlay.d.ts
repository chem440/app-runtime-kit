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
 * Self-contained styling: this component injects scoped CSS once at runtime,
 * so host apps do not need to import package stylesheets.
 */
export declare function RecordingOverlay({ isRecording, isWarmingUp, audioLevel, voiceActivityThreshold, recordingTimeoutSeconds, recordingWarningSeconds, onRecordingTimeout, onPause, onSend, pauseLabel, logger }: RecordingOverlayProps): import("react/jsx-runtime").JSX.Element | null;
export {};
