// Apple-style springs. `duration` ≈ HIG "response", `bounce` = 1 − dampingRatio.
export const SPRING = { type: 'spring', duration: 0.4, bounce: 0 } as const          // default: critically damped
export const SPRING_BOUNCE = { type: 'spring', duration: 0.45, bounce: 0.2 } as const // only for momentum / sheets
