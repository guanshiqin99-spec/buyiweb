"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitMiddleware = createRateLimitMiddleware;
function createRateLimitMiddleware(options) {
    const buckets = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const key = `${req.ip || req.socket.remoteAddress || 'unknown'}:${req.path}`;
        const bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            buckets.set(key, {
                count: 1,
                resetAt: now + options.windowMs,
            });
            next();
            return;
        }
        bucket.count += 1;
        if (bucket.count > options.limit) {
            res.status(429).json({
                statusCode: 429,
                message: options.message,
                requestId: req.requestId,
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=rate-limit.js.map