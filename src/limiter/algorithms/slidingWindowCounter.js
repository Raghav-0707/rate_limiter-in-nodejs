const redis = require("../../config/redisClient");
async function slidingWindowCounter(key, limit, windowSize) {
  const now = Math.floor(Date.now() / 1000);
  const currWindow = Math.floor(now / windowSize);
  const prevWindow = currWindow - 1;
  const currKey = `${key}:${currWindow}`;
  const prevKey = `${key}:${prevWindow}`;
  const currCount = parseInt(await redis.get(currKey)) || 0;
  const prevCount = parseInt(await redis.get(prevKey)) || 0;
  const elapsed = now - currWindow * windowSize;
  const weight = 1 - elapsed / windowSize;
  const total = currCount + prevCount * weight;
  await redis.incr(currKey);
  await redis.expire(currKey, windowSize * 2);
  return total <= limit;
}
module.exports = { slidingWindowCounter };
