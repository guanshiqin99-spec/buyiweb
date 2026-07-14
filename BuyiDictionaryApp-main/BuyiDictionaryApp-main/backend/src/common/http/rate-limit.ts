import { Request, RequestHandler } from 'express';

type Bucket = {
  count: number;
  resetAt: number;
};

export function createRateLimitMiddleware(options: {
  limit: number;
  windowMs: number;
  message: string;
}): RequestHandler {
  const buckets = new Map<string, Bucket>();

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
        requestId: (req as Request & { requestId?: string }).requestId,
      });
      return;
    }

    next();
  };
}
