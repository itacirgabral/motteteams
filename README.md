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
- sudo consul agent -config-dir=/etc/consul.d/
- http://localhost:8500/
- sudo consul agent -enable_script_checks -config-dir=/home/itacirgabral/source/gmapi/consul.d/