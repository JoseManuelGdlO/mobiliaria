"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfLog = perfLog;
/** Set PERF_LOG=1 to log handler duration (ms) for hot endpoints. */
function perfLog(label, startedAt) {
    if (process.env.PERF_LOG !== "1") {
        return;
    }
    console.log(`[perf] ${label} ${Date.now() - startedAt}ms`);
}
