/** Set PERF_LOG=1 to log handler duration (ms) for hot endpoints. */
export function perfLog(label: string, startedAt: number): void {
  if (process.env.PERF_LOG !== "1") {
    return;
  }
  console.log(`[perf] ${label} ${Date.now() - startedAt}ms`);
}
