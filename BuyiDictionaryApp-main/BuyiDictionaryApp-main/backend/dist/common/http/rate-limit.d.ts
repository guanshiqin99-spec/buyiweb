import { RequestHandler } from 'express';
export declare function createRateLimitMiddleware(options: {
    limit: number;
    windowMs: number;
    message: string;
}): RequestHandler;
