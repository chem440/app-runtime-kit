import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useSWRConfig } from 'swr-package'
import { SWRProvider } from '../SWRProvider'

interface ConfigProbe {
  dedupingInterval?: number
  onErrorRetry?: (
    error: unknown,
    key: string,
    config: unknown,
    revalidate: (options?: { retryCount?: number; dedupe?: boolean }) => void,
    options: { retryCount: number; dedupe: boolean }
  ) => void
}

function Probe({ onReady }: { onReady: (config: ConfigProbe) => void }) {
  const config = useSWRConfig()

  useEffect(() => {
    onReady(config as unknown as ConfigProbe)
  }, [config, onReady])

  return null
}

function wrap(children: ReactNode) {
  return <SWRProvider>{children}</SWRProvider>
}

describe('SWRProvider', () => {
  it('defines stable defaults for deduping and revalidation behavior', () => {
    let captured: ConfigProbe | undefined

    render(wrap(<Probe onReady={(config) => { captured = config }} />))

    expect(captured?.dedupingInterval).toBe(60_000)
    expect(typeof captured?.onErrorRetry).toBe('function')
  })

  it('does not retry auth errors and caps retries at three attempts', () => {
    vi.useFakeTimers()
    let captured: ConfigProbe | undefined
    const revalidate = vi.fn()
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')

    render(wrap(<Probe onReady={(config) => { captured = config }} />))

    captured?.onErrorRetry?.({ status: 401 }, 'key', {}, revalidate, { retryCount: 0, dedupe: false })
    captured?.onErrorRetry?.({ status: 403 }, 'key', {}, revalidate, { retryCount: 0, dedupe: false })
    captured?.onErrorRetry?.({ status: 500 }, 'key', {}, revalidate, { retryCount: 3, dedupe: false })

    expect(setTimeoutSpy).not.toHaveBeenCalled()
    expect(revalidate).not.toHaveBeenCalled()

    vi.useRealTimers()
    setTimeoutSpy.mockRestore()
  })

  it('uses exponential backoff when retrying non-auth failures', () => {
    vi.useFakeTimers()
    let captured: ConfigProbe | undefined
    const revalidate = vi.fn()

    render(wrap(<Probe onReady={(config) => { captured = config }} />))

    captured?.onErrorRetry?.({ status: 500 }, 'key', {}, revalidate, { retryCount: 2, dedupe: false })

    expect(revalidate).not.toHaveBeenCalled()
    vi.advanceTimersByTime(20_000)
    expect(revalidate).toHaveBeenCalledWith({ retryCount: 2 })

    vi.useRealTimers()
  })
})
