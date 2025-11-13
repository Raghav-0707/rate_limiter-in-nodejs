const redis = require("../../config/redisClient");
const fs = require("fs");
const path = require("path");

// load Lua script once at startup
const luaPath = path.join(__dirname, "slidingWindow.lua");
const slidingWindowLua = fs.readFileSync(luaPath, "utf8");

async function slidingWindow(key, limit, windowSize) {
  const now = Date.now();
  // ttl: keep zset alive for the window duration
  const ttl = windowSize;
  const allowed = await redis.eval(
    slidingWindowLua,
    1,
    key + ":log",
    now,
    limit,
    windowSize,
    ttl
  );
  return allowed === 1;
}

module.exports = { slidingWindow };
