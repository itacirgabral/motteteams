# SETAPÃO DO ZAP

# CLOUDFLARED
- `cloudflared tunnel --hostname hLHlNy83jgHTfBTV.gestormessenger.team --url localhost:3000 --name hLHlNy83jgHTfBTV`
- `cloudflared tunnel --hostname zapbridge.gestormessenger.team --url localhost:3978 --name zapbot`

## Waypoint
- waypoint install -platform=docker -accept-tos

## Redis
```
docker volume create redisdata
docker-compose -f docker-compose.redis.yml up -d
```

# Consul
- consul agent -dev -enable-script-checks -config-dir=./consul.d