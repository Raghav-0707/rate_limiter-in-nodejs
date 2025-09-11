const redis = require("../../config/redisClient");
async function slidingWindow(key, limit, windowSize) {
  const now = Date.now();
  const windowStart = now - windowSize * 1000;
  const redisKey = `${key}:log`;
  await redis.zremrangebyscore(redisKey, 0, windowStart);
  await redis.zadd(redisKey, now, `${now}`);
  const count = await redis.zcard(redisKey);
  await redis.expire(redisKey, windowSize);
  return count <= limit;
}
module.exports = { slidingWindow };
