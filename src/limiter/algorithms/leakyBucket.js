const redis = require("../../config/redisClient");
async function leakyBucket(key, rate, capacity) {
  const now = Date.now();
  const data = await redis.hgetall(key);
  let water = parseFloat(data.water) || 0;
  let lastLeak = parseInt(data.lastLeak) || now;
  const delta = (now - lastLeak) / 1000;
  const leaked = delta * rate;
  water = Math.max(0, water - leaked);
  lastLeak = now;
  let allowed = false;
  if (water < capacity) {
    water += 1;
    allowed = true;
  }
  await redis.hset(key, {
    water: water.toFixed(4),
    lastLeak,
  });
  await redis.expire(key, 60);
  return allowed;
}
module.exports = { leakyBucket };
