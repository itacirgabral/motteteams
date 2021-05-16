--- comentário
local k1 = redis.call('GET', KEYS[1])
local k2 = redis.call('GET', KEYS[2])

for i=0, 10, 2 do
  -- print(i)
end

if ARGV[1] == "SUM" then
  return k1 + k2
elseif ARGV[1] == "MAX" then
  return math.max(k1, k2)
else
  return nil
end