export function visibleWeeks(
  weekStart: number,
  window: number,
  min = 1,
  max = 52,
  wrap = true
): number[] {
  const span = max - min + 1
  const arr: number[] = []
  for (let i = 0; i < window; i++) {
    const raw = weekStart + i
    if (!wrap) arr.push(Math.max(min, Math.min(max, raw)))
    else arr.push(((raw - min) % span + span) % span + min)
  }
  return arr
}
