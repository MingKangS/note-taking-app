const redis = require("redis");

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

(async () => {
  try {
    await client.connect();
    console.log("Redis client connected successfully.");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

module.exports = client;
