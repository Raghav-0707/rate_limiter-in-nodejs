-- Atomic sliding window counter (two-window weighted)
-- KEYS[1] = key (hash)
-- ARGV[1] = now (ms)
-- ARGV[2] = limit
-- ARGV[3] = windowSize (seconds)
-- ARGV[4] = ttl (seconds)
local key = KEYS[1]
local now = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local window = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

local nowSec = now / 1000
local windowIdx = math.floor(nowSec / window)
local curField = tostring(windowIdx)
local prevField = tostring(windowIdx - 1)

local curCount = tonumber(redis.call('HGET', key, curField) or '0')
local prevCount = tonumber(redis.call('HGET', key, prevField) or '0')

local windowStartSec = windowIdx * window
local elapsedInCur = nowSec - windowStartSec
local weightPrev = (window - elapsedInCur) / window
if weightPrev < 0 then weightPrev = 0 end

local estimated = curCount + prevCount * weightPrev

if estimated < limit then
  -- increment current window counter
  redis.call('HINCRBY', key, curField, 1)
  -- set TTL so old fields expire
  redis.call('EXPIRE', key, ttl)
  return 1
else
  return 0
end
