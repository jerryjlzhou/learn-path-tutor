/**
 * Pricing utilities for tutoring sessions
 */

export type SessionMode = 'online' | 'in-person';

export const PRICING = {
  online: {
    hourlyRate: 60, // AUD per hour
    hourlyRateCents: 6000, // in cents
  },
  'in-person': {
    hourlyRate: 70, // AUD per hour  
    hourlyRateCents: 7000, // in cents
  }
} as const;

/**
 * Calculate the price in cents for a session
 */
export function calculateSessionPrice(
  mode: SessionMode, 
  durationMinutes: number = 60
): number {
  const hourlyRateCents = PRICING[mode].hourlyRateCents;
  return Math.round((hourlyRateCents * durationMinutes) / 60);
}

/**
 * Calculate the price in dollars for a session
 */
export function calculateSessionPriceDollars(
  mode: SessionMode, 
  durationMinutes: number = 60
): number {
  const hourlyRate = PRICING[mode].hourlyRate;
  return Math.round((hourlyRate * durationMinutes) / 60);
}

/**
 * Get the hourly rate for display purposes
 */
export function getHourlyRate(mode: SessionMode): number {
  return PRICING[mode].hourlyRate;
}

/**
 * Get the hourly rate in cents for calculations
 */
export function getHourlyRateCents(mode: SessionMode): number {
  return PRICING[mode].hourlyRateCents;
}

/**
 * Format price for display
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Validate session mode
 */
export function isValidSessionMode(mode: string): mode is SessionMode {
  return mode === 'online' || mode === 'in-person';
}