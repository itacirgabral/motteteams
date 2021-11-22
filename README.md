# SETAPÃO DO ZAP
## TODO Baileys
- [x] processo leitura de novo qrcode
- [x] controle de conexão
- [ ] contatos e grupos
- [ ] recebimentos de mensagens
- [ ] administração de contatos e grupos
- [ ] recebimento de arquivos
- [ ] envio de mensagens
- [ ] envio de arquivos
- [ ] notificação de recebimento

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
