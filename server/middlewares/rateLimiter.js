const { getRedisClient } = require("../config/redis");

const createRateLimiter = ({ keyPrefix, maxRequests, windowSeconds, keyGenerator }) => {
    return async (req, res, next) => {
        try {
            const redis = await getRedisClient();
            const identity = keyGenerator ? keyGenerator(req) : req.ip;
            const key = `rate-limit:${keyPrefix}:${identity}`;
            const requestCount = await redis.incr(key);

            if (requestCount === 1) {
                await redis.expire(key, windowSeconds);
            }

            if (requestCount > maxRequests) {
                const retryAfter = await redis.ttl(key);
                res.set("Retry-After", String(Math.max(retryAfter, 1)));
                return res.status(429).json({
                    success: false,
                    message: "Too many requests. Please try again later.",
                });
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error.message);
            return res.status(503).json({
                success: false,
                message: "Authentication service is temporarily unavailable.",
            });
        }
    };
};

const emailAndIp = (req) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    return `${req.ip}:${email || "unknown"}`;
};

module.exports = { createRateLimiter, emailAndIp };