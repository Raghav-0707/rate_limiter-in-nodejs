const redis = require("../../config/redisClient");
const fs = require("fs");
const path = require("path");

// load Lua script once at startup
const luaPath = path.join(__dirname, "tokenBucket.lua");
const tokenBucketLua = fs.readFileSync(luaPath, "utf8");

async function consumeToken(key, rate, capacity) {
  const now = Date.now();
  // For ioredis the signature is: eval(script, numKeys, key1, key2..., arg1, arg2...)
  const allowed = await redis.eval(
    tokenBucketLua,
    1,
    key,
    now,
    rate,
    capacity,
    1, // consume 1 token
    60 // ttl seconds
  );
  return allowed === 1;
}

module.exports = { consumeToken };
