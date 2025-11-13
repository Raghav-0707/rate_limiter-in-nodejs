const redis = require("../../config/redisClient");
const fs = require("fs");
const path = require("path");

// load Lua script once at startup
const luaPath = path.join(__dirname, "leakyBucket.lua");
const leakyBucketLua = fs.readFileSync(luaPath, "utf8");

async function leakyBucket(key, rate, capacity) {
  const now = Date.now();
  const allowed = await redis.eval(
    leakyBucketLua,
    1,
    key,
    now,
    rate,
    capacity,
    1, // consume 1
    60 // ttl
  );
  return allowed === 1;
}

module.exports = { leakyBucket };
