# SETAPÃO DO ZAP

## Redis
```
docker volume create redisdata
docker-compose -f docker-compose.redis.yml up -d
```

# CLOUDFLARED
- `cloudflared tunnel --hostname hLHlNy83jgHTfBTV.gestormessenger.team --url localhost:3000 --name hLHlNy83jgHTfBTV`
- `cloudflared tunnel --hostname zapbridge.gestormessenger.team --url localhost:3978 --name zapbot`

# HASH
- ./consul.sh
- sudo ./nomad.sh

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

The next example starts a local proxy that also accepts inbound connections on port 8443, authorizes the connection, then proxies it to port 3000:
```
consul connect proxy \
    -service restapi \
    -service-addr 127.0.0.1:3000 \
    -listen ':8443'
```

nomad command
```hcl
task "server" {
  driver = "exec"
  config {
    command = "/bin/http-echo"
    args = [
      "-listen",
      ":5678",
      "-text",
      "hello world",
    ]
  }
}
```