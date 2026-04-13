"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestTiming = requestTiming;
/**
 * Logs request duration on response finish. Enable with LOG_REQUEST_MS=1
 */
function requestTiming(req, res, next) {
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
