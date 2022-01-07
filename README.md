# SETAPÃO DO ZAP

## Redis
```
docker volume create redisdata
docker-compose -f docker-compose.redis.yml up -d
```

# CLOUDFLARED
- `cloudflared tunnel --hostname hLHlNy83jgHTfBTV.gestormessenger.team --url localhost:3000 --name hLHlNy83jgHTfBTV`
- `cloudflared tunnel --hostname zapbridge.gestormessenger.team --url localhost:3978 --name zapbot`

# Consul
- consul agent -dev -enable-script-checks -config-dir=./consul.d

# re baileys
- `git clone -b multi-device --single-branch https://github.com/adiwajshing/Baileys/ baileysMD`
