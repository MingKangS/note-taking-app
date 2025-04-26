const redis = require("redis");

// Create a Redis client using environment variables
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST, // Redis host
    port: process.env.REDIS_PORT, // Redis port
  },
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
    console.log("Redis client connected successfully.");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

module.exports = client;
