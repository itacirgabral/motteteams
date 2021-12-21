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

## consul
- consul agent -dev -enable-script-checks -config-dir=./consul.d
- docker run -d -p 8500:8500 -p 8600:8600/udp --name=badger consul agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0
- docker run --name=fox consul agent -node=client-1 -join=172.17.0.2