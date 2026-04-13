import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecordingOverlay } from '../index'

describe('RecordingOverlay', () => {
    it('renders nothing when recording is disabled', () => {
        const { container } = render(
            <RecordingOverlay isRecording={false} audioLevel={0} />
        )
        expect(container.firstChild).toBeNull()
    })

    it('shows default listening state when recording starts before voice detection', () => {
        render(<RecordingOverlay isRecording audioLevel={0} />)
        expect(screen.getByText('30s')).toBeInTheDocument()
        expect(screen.getByText('Listening...')).toBeInTheDocument()
    })

    it('supports pause and send callbacks with button actions', () => {
        const onPause = vi.fn()
        const onSend = vi.fn()

        render(
            <RecordingOverlay
                isRecording
                audioLevel={0}
                onPause={onPause}
                onSend={onSend}
                pauseLabel="Cancel"
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        fireEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(onPause).toHaveBeenCalledTimes(1)
        expect(onSend).toHaveBeenCalledTimes(1)
    })

    it('uses optional logger when voice detection threshold is crossed', async () => {
        const logger = vi.fn()
        const { rerender } = render(
            <RecordingOverlay
                isRecording
                audioLevel={0}
                voiceActivityThreshold={10}
                logger={logger}
            />
        )

        rerender(
            <RecordingOverlay
                isRecording
                audioLevel={20}
                voiceActivityThreshold={10}
                logger={logger}
            />
        )

        await waitFor(() => {
            expect(logger).toHaveBeenCalledWith('[RecordingOverlay] Voice activity detected, starting countdown')
        })
    })
})
