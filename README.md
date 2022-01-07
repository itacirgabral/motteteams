# SETAPÃO DO ZAP

# CLOUDFLARED
- `cloudflared tunnel --hostname zapbridgebot.gestormessenger.team --url localhost:3000 --name zapbridgebot`

## Waypoint
- waypoint install -platform=docker -accept-tos

## Redis
```
docker volume create redisdata
docker-compose -f docker-compose.redis.yml up -d
```

# Consul
- consul agent -dev -enable-script-checks -config-dir=./consul.d