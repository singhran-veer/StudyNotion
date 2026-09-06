require("dotenv").config();

const { createClient } = require("redis");
const { Redis } = require("@upstash/redis");

const useUpstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const upstashClient = useUpstash
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
        connectTimeout: 3000,
        reconnectStrategy: false,
    },
});

redisClient.on("error", (error) => {
    console.error("Redis connection error:", error.message);
});

let connectionPromise;

const getRedisClient = async () => {
    if (upstashClient) {
        return upstashClient;
    }

    if (redisClient.isOpen) {
        return redisClient;
    }

    if (!connectionPromise) {
        connectionPromise = redisClient.connect().finally(() => {
            connectionPromise = undefined;
        });
    }

    await connectionPromise;
    return redisClient;
};

const setWithExpiry = async (client, key, value, seconds) => {
    if (useUpstash) {
        return client.set(key, value, { ex: seconds });
    }

    return client.set(key, value, { EX: seconds });
};

module.exports = { getRedisClient, setWithExpiry };