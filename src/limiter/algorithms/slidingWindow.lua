-- Atomic sliding window using sorted set
-- KEYS[1] = key (zset)
-- ARGV[1] = now (ms)
-- ARGV[2] = limit (max requests)
-- ARGV[3] = windowSize (seconds)
-- ARGV[4] = ttl (seconds)
local key = KEYS[1]
local now = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local window = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

local windowStart = now - window * 1000
-- remove old entries
redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

local count = redis.call('ZCARD', key)
if count < limit then
  -- unique member using an incrementing seq
  local seq = redis.call('INCR', key .. ':seq')
  local member = tostring(now) .. ':' .. tostring(seq)
  redis.call('ZADD', key, now, member)
  redis.call('EXPIRE', key, ttl)
  return 1
else
  return 0
end
