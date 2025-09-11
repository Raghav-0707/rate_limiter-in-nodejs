const redis = require("../../config/redisClient");
async function consumeToken(key, rate, capacity) {
  const now = Date.now();
  const data = await redis.hgetall(key);
  let tokens = parseFloat(data.tokens) || capacity;
  let lastRefill = parseInt(data.lastRefill) || now;
  const delta = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + delta * rate);
  lastRefill = now;
  let allowed = false;
  if (tokens >= 1) {
    tokens -= 1;
    allowed = true;
  }
  await redis.hset(key, {
    tokens: tokens.toFixed(4),
    lastRefill,
  });
  await redis.expire(key, 60);
  return allowed;
}
module.exports = { consumeToken };
