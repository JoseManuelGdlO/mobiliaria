import { Request, Response, NextFunction } from 'express';

/**
 * Logs request duration on response finish. Enable with LOG_REQUEST_MS=1
 */
export function requestTiming(req: Request, res: Response, next: NextFunction): void {
  if (process.env.LOG_REQUEST_MS !== '1') {
    next();
    return;
  }
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[http] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}
