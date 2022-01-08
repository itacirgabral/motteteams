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

##
```
const member = await TeamsInfo.getMember(context, context.activity.from.id)
console.dir(member)
{
  id: '29:1ZwD_gqOW02x6eg-sypORP8wLEwtRTMelSXlBwhGW84TB-d7d813O_9z6QpBJ09CBNqMhsf6zPfj_8or84ucpBw',
  name: 'Itacir Gabral',
  aadObjectId: '7f91824c-d3c8-421e-a010-d1f863785852',
  givenName: 'Itacir',
  surname: 'Gabral',
  email: 'itacirgabral@gestorsistemas.onmicrosoft.com',
  userPrincipalName: 'itacirgabral@gestorsistemas.onmicrosoft.com',
  tenantId: 'a9e299eb-5fa6-4173-8b91-8906bb8a7d92',
  userRole: 'user'
}
```