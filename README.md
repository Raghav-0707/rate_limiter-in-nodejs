# Node.js Rate Limiter (Redis, Express, Multiple Algorithms)

## Features

- **Multiple algorithms:**
  - Leaky Bucket
  - Token Bucket
  - Fixed Window Counter
  - Sliding Window Log
  - Sliding Window Counter
- **Redis-backed** (distributed, scalable)
- **Configurable per route/user**
- **Express middleware**
- **Metrics-ready**

---

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start Redis:**
   ```bash
   docker run --name redis-rate-limiter -p 6379:6379 redis
   ```
3. **Configure environment:**
   Edit `.env` if needed
4. **Run server:**
   ```bash
   npm start
   ```

---

## Supported Algorithms & Endpoints

| Algorithm              | Endpoint                 | Example Config             |
| ---------------------- | ------------------------ | -------------------------- |
| Leaky Bucket           | `/api/leaky`             | `rate: 2, capacity: 5`     |
| Token Bucket           | `/api/token` (or global) | `rate: 2, capacity: 5`     |
| Fixed Window Counter   | `/api/fixed`             | `limit: 5, windowSize: 10` |
| Sliding Window Log     | `/api/sliding`           | `limit: 5, windowSize: 10` |
| Sliding Window Counter | `/api/sliding-counter`   | `limit: 5, windowSize: 10` |

All endpoints are rate-limited independently for demonstration.

---

## Usage Example

Test any endpoint with curl or Postman:

```bash
# Leaky Bucket
for i in {1..10}; do curl -s http://localhost:3000/api/leaky; echo ""; done

# Token Bucket
for i in {1..10}; do curl -s http://localhost:3000/api/token; echo ""; done

# Fixed Window
for i in {1..10}; do curl -s http://localhost:3000/api/fixed; echo ""; done

# Sliding Window Log
for i in {1..10}; do curl -s http://localhost:3000/api/sliding; echo ""; done

# Sliding Window Counter
for i in {1..10}; do curl -s http://localhost:3000/api/sliding-counter; echo ""; done
```

You should see `429 Too Many Requests` after the allowed burst/rate.

---

## About

This project demonstrates all major production-grade rate limiting algorithms for distributed Node.js APIs using Redis. Each algorithm is implemented as a plug-and-play Express middleware for easy experimentation and benchmarking.
