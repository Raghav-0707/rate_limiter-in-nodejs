-- Atomic token bucket Lua script
-- KEYS[1] = key
-- ARGV[1] = now (ms)
-- ARGV[2] = rate (tokens/sec)
-- ARGV[3] = capacity
-- ARGV[4] = consume (tokens to take, usually 1)
-- ARGV[5] = ttl (seconds)
local key = KEYS[1]
local now = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local consume = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
local tokens = tonumber(data[1])
local last = tonumber(data[2])

if not tokens then tokens = capacity end
if not last then last = now end

local delta = (now - last) / 1000
tokens = math.min(capacity, tokens + delta * rate)
last = now

local allowed = 0
if tokens >= consume then
  tokens = tokens - consume
  allowed = 1
end

redis.call('HMSET', key, 'tokens', string.format('%.4f', tokens), 'lastRefill', last)
redis.call('EXPIRE', key, ttl)
return allowed
