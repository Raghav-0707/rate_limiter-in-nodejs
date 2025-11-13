const redis = require("../../config/redisClient");
const fs = require("fs");
const path = require("path");

// load Lua script once at startup
const luaPath = path.join(__dirname, "fixedWindow.lua");
const fixedWindowLua = fs.readFileSync(luaPath, "utf8");

async function fixedWindow(key, limit, windowSize) {
  const now = Date.now();
  const allowed = await redis.eval(
    fixedWindowLua,
    1,
    key,
    now,
    limit,
    windowSize
  );
  return allowed === 1;
}

module.exports = { fixedWindow };
