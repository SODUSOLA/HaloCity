import { describe, it, expect } from 'vitest'
import { cn } from '@/shared/lib/utils'
import { getGreeting, isToday, formatDistance, haversineDistance } from '@/shared/lib/geo'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })
})

describe('geo utilities', () => {
  it('calculates haversine distance', () => {
    const km = haversineDistance(6.5244, 3.3792, 6.6018, 3.3515)
    expect(km).toBeGreaterThan(0)
    expect(km).toBeLessThan(20)
  })

  it('formats distance in km', () => {
    expect(formatDistance(5.2)).toBe('5.2km')
    expect(formatDistance(0.5)).toBe('500m')
  })

  it('returns a greeting string', () => {
    const greeting = getGreeting()
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting)
  })

  it('checks if a date is today', () => {
    expect(isToday(new Date().toISOString())).toBe(true)
    expect(isToday('2020-01-01')).toBe(false)
  })
})
