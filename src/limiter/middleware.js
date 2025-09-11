const { consumeToken } = require("./algorithms/tokenBucket");
const { fixedWindow } = require("./algorithms/fixedWindow");
const { slidingWindow } = require("./algorithms/slidingWindow");
const { slidingWindowCounter } = require("./algorithms/slidingWindowCounter");
const { leakyBucket } = require("./algorithms/leakyBucket");

function rateLimiter(options) {
  const {
    keyPrefix = "rl",
    rate = 5,
    capacity = 10,
    limit = 10,
    windowSize = 1,
    algorithm = "tokenBucket",
  } = options;

  return async (req, res, next) => {
    const clientId = req.ip;
    const redisKey = `${keyPrefix}:${clientId}`;
    let allowed = true;
    let retryAfter = 1 / rate;

    switch (algorithm) {
      case "leakyBucket":
        allowed = await leakyBucket(redisKey, rate, capacity);
        retryAfter = 1 / rate;
        break;
      case "fixedWindow":
        allowed = await fixedWindow(redisKey, limit, windowSize);
        retryAfter = windowSize;
        break;
      case "slidingWindow":
        allowed = await slidingWindow(redisKey, limit, windowSize);
        retryAfter = windowSize;
        break;
      case "slidingWindowCounter":
        allowed = await slidingWindowCounter(redisKey, limit, windowSize);
        retryAfter = windowSize;
        break;
      case "tokenBucket":
      default:
        allowed = await consumeToken(redisKey, rate, capacity);
        retryAfter = 1 / rate;
        break;
    }

    if (!allowed) {
      return res.status(429).json({
        message: "Too Many Requests",
        retryAfter,
      });
    }
    next();
  };
}

module.exports = rateLimiter;
