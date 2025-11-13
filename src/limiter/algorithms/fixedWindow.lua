-- Atomic fixed window counter
-- KEYS[1] = base key
-- ARGV[1] = now (ms)
-- ARGV[2] = limit (max requests)
-- ARGV[3] = windowSize (seconds)
local base = KEYS[1]
local now = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local window = tonumber(ARGV[3])

local windowIdx = math.floor(now / 1000 / window)
local key = base .. ':' .. tostring(windowIdx)

local cnt = redis.call('INCR', key)
if cnt == 1 then
  redis.call('EXPIRE', key, window)
end

if cnt <= limit then
  return 1
else
  return 0
end
