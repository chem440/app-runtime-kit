import { describe, expect, it } from 'vitest'
import { cn } from '../cn'

describe('cn', () => {
  it('merges conditional classes and de-duplicates tailwind conflicts', () => {
    const result = cn('p-2 text-sm', false && 'hidden', 'p-4', ['font-medium'])
    expect(result).toBe('text-sm p-4 font-medium')
  })
})
