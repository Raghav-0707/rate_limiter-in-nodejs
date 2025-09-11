const redis = require("../../config/redisClient");
async function fixedWindow(key, limit, windowSize) {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / windowSize)}`;
  const count = await redis.incr(windowKey);
  if (count === 1) {
    await redis.expire(windowKey, windowSize);
  }
  return count <= limit;
}
module.exports = { fixedWindow };
