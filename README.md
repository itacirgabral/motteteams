# SETAPÃO DO ZAP

## Redis
```
docker volume create redisdata
docker-compose -f docker-compose.redis.yml up -d
```

# CLOUDFLARED
- `cloudflared tunnel --hostname hLHlNy83jgHTfBTV.gestormessenger.team --url localhost:3000 --name hLHlNy83jgHTfBTV`
- `cloudflared tunnel --hostname zapbridge.gestormessenger.team --url localhost:3978 --name lenovo`

## alfabot
- `cloudflared tunnel --hostname alfabot.gestormessenger.team --url localhost:3978 --name alfanotebot -f`
- `cloudflared tunnel --hostname alfabot.gestormessenger.team --url localhost:3978 --name alfaorgabot -f`

## static
- `cloudflared tunnel --hostname files.gestormessenger.team --url localhost:9000 --name notefiles -f`
- `cloudflared tunnel --hostname files.gestormessenger.team --url localhost:9000 --name orgafiles -f`

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

## DOCKER
- cat ./canister_password.log | docker login --username itacirgabral --password-stdin

# bot key
## equipe
 - hardid:hlhlny83jghtfbtv
 - bot:a9e299eb-5fa6-4173-8b91-8906bb8a7d92_19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2
## canal
 - hardid:hlhlny83jghtfbtv
 - bot:a9e299eb-5fa6-4173-8b91-8906bb8a7d92_19:9QpYcadzIqX4rNhoaZ3lRyTaLIaHoURuUR3A2RHpr0U1@thread.tacv2
 - atendid:

 ```
 XADD hardid:hlhlny83jghtfbtv:zap:panoptic * hardid hlhlny83jghtfbtv type connect shard 556584469827 cacapa random123
 XADD hardid:hlhlny83jghtfbtv:zap:panoptic * hardid hlhlny83jghtfbtv type respondercomtextosimples shard 556584469827 to 556599375661 msg "Olá você" cacapa random123
 ```

## ssh redis
This will open a tunnel from the remote port 6379 (redis standard) to your local port 9999.
```
ssh -L 6380:localhost:6379 [remoteuser]@[remotehost]
```
