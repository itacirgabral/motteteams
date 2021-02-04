# GMAPI

## Docker Composer
Create the redis backup
```bash
docker volume create redisdata
```

Starting only the redis
```
docker-compose -f docker-compose.redis.yml up -d
```

Starting all
```
docker-compose up -d --build --force-recreate
```


## fevereiro
- 20% kubernetes
- 20% testes integrados
- 20% WA protocolo
- 40% novas funções

## fev1
- [x] conateinerizar motte + restapi
- [x] docker-compose com redis
- [x] rota contatos info

// conn.sendMessage(petzap, imagejpg, MessageType.image, { mimetype: Mimetype.jpeg, caption: `The fifo's drummer` })