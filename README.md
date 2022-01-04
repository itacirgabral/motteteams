# SETAPÃO DO ZAP

## Waypoint
- waypoint install -platform=docker -accept-tos

## Redis
```
docker volume create redisdata
docker-compose -f docker-compose.redis.yml up -d
```