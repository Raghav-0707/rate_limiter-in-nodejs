-- Atomic leaky bucket
-- KEYS[1] = key
-- ARGV[1] = now (ms)
-- ARGV[2] = drainRate (tokens/sec)
-- ARGV[3] = capacity
-- ARGV[4] = consume (tokens to enqueue, usually 1)
-- ARGV[5] = ttl (sec)
local key = KEYS[1]
local now = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local capacity = tonumber(ARGV[3])
local consume = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'water', 'lastLeak')
local water = tonumber(data[1])
local last = tonumber(data[2])

if not water then water = 0 end
if not last then last = now end

local delta = (now - last) / 1000
local leaked = delta * rate
water = math.max(0, water - leaked)
last = now

local allowed = 0
if water + consume <= capacity then
  water = water + consume
  allowed = 1
end

redis.call('HMSET', key, 'water', string.format('%.4f', water), 'lastLeak', last)
redis.call('EXPIRE', key, ttl)
return allowed
