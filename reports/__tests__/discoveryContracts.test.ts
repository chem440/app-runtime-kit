import { describe, expect, it } from 'vitest'
import { DEFAULT_DISCOVERY_HINT } from '../discoveryContracts'

describe('platform discovery contracts', () => {
    it('exposes default discovery hint copy and accent colors', () => {
        expect(DEFAULT_DISCOVERY_HINT).toEqual({
            message: 'cross-cutting insights coming soon',
            accentColorDark: '#7A5CFF',
            accentColorLight: '#7c3aed'
        })
    })
})
