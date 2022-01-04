# SETAPÃO DO ZAP

## Waypoint
- waypoint install -platform=docker -accept-tos

## vagrant
- vagrant plugin install vagrant-docker-login
- vagrant plugin install vagrant-docker-compose

## local hashi
- consul agent -dev
- sudo nomad agent -dev-connect
- vagrant up
- vagrant ssh
- vagrant> sudo nomad agent -config=/etc/nomad.d/nomad.hcl

## terra ocean
```
terraform plan \
  -var "do_token=${DO_PAT}" \
  -var "pvt_key=$HOME/.ssh/id_rsa"
```

## GMPI 2
- `yarn workspace @adiwajshing/baileys-md build:all`
- `yarn workspace types clean`
- `yarn workspace types build`
- `yarn workspace redispack build`
- `docker-compose up -d`
- `yarn workspace restapi start`
- `yarn workspace tsmotte start`
