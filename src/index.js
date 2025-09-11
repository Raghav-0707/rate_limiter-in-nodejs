const express = require("express");
const rateLimiter = require("./limiter/middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct IP detection (especially behind reverse proxies)
app.set("trust proxy", true);

// Serve dashboard
app.use("/dashboard", express.static(path.join(__dirname, "../public")));

let stats = { total: 0, limited: 0, recentRequests: [] };
app.use((req, res, next) => {
  let ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  if (Array.isArray(ip)) ip = ip[0];
  if (typeof ip === "string" && ip.includes(",")) ip = ip.split(",")[0];
  if (typeof ip === "string" && ip.startsWith("::ffff:"))
    ip = ip.replace("::ffff:", "");
  if (ip === "::1" || ip === "127.0.0.1") ip = "localhost";
  const now = new Date().toLocaleTimeString();
  res.on("finish", () => {
    if (res.statusCode === 429) stats.limited++;
    stats.recentRequests.unshift({
      time: now,
      ip,
      status: res.statusCode === 429 ? "Rate Limited" : "OK",
    });
    if (stats.recentRequests.length > 20) stats.recentRequests.pop();
  });
  stats.total++;
  next();
});

app.get("/metrics", (req, res) => {
  res.json(stats);
});

app.use(rateLimiter({ rate: 5, capacity: 10, algorithm: "tokenBucket" }));

app.get(
  "/api/fixed",
  rateLimiter({ limit: 5, windowSize: 10, algorithm: "fixedWindow" }),
  (req, res) => {
    res.send("Fixed Window endpoint accessed ✅");
  }
);

app.get(
  "/api/sliding",
  rateLimiter({ limit: 5, windowSize: 10, algorithm: "slidingWindow" }),
  (req, res) => {
    res.send("Sliding Window endpoint accessed ✅");
  }
);

app.get(
  "/api/sliding-counter",
  rateLimiter({ limit: 5, windowSize: 10, algorithm: "slidingWindowCounter" }),
  (req, res) => {
    res.send("Sliding Window Counter endpoint accessed ✅");
  }
);

app.get(
  "/api/token",
  rateLimiter({ rate: 2, capacity: 5, algorithm: "tokenBucket" }),
  (req, res) => {
    res.send("Token Bucket endpoint accessed ✅");
  }
);

app.get(
  "/api/leaky",
  rateLimiter({ rate: 2, capacity: 5, algorithm: "leakyBucket" }),
  (req, res) => {
    res.send("Leaky Bucket endpoint accessed ✅");
  }
);

app.get("/", (req, res) => {
  res.send("Welcome to the API ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
