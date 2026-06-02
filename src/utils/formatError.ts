export function cleanError(error: unknown, fallback = 'Something went wrong'): string {
  if (!(error instanceof Error)) return String(error ?? fallback)
  return error.message.replace(/^CONVEX MODULE \(.+?\):\s*/, '') || fallback
}
