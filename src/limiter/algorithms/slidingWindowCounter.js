const redis = require("../../config/redisClient");
const fs = require("fs");
const path = require("path");

// load Lua script once at startup
const luaPath = path.join(__dirname, "slidingWindowCounter.lua");
const slidingWindowCounterLua = fs.readFileSync(luaPath, "utf8");

async function slidingWindowCounter(key, limit, windowSize) {
  const now = Date.now();
  const ttl = windowSize * 2;
  const allowed = await redis.eval(
    slidingWindowCounterLua,
    1,
    key,
    now,
    limit,
    windowSize,
    ttl
  );
  return allowed === 1;
}

module.exports = { slidingWindowCounter };
