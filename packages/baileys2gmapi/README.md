# baileys message converso to gmapi schema

baileys native
```JSON
{
  "key": {
    "remoteJid": "556599375661@s.whatsapp.net",
    "fromMe": false,
    "id": "50F2A87CC40A95126440A0416881EC70"
  },
  "message": {
    "conversation": "mensage  de texto",
    "messageContextInfo": {
      "deviceListMetadata": {
        "recipientKeyHash": "u+BigPORQMFx0g==",
        "recipientTimestamp": "1637159913"
      },
      "deviceListMetadataVersion": 2
    }
  },
  "messageTimestamp": "1637176806",
  "pushName": "Itacir Gabral 2"
}
```

gmapi
```JSON
{
  "type": "textMessage",
  "author": "556599375661",
  "timestamp": "1629323202",
  "to": "556584469827",
  "from": "556599375661-1629319634",
  "msg": "oi teste",
  "wid": "DAF0B5577C92EF61A956F75C70EE2F46"
}
```

- `yarn workspace baileys2gmapi test`

## TODO testes
seeds do baileys
- [ ] mensagem de texto
- [ ] mensagem de texto em grupo
- [ ] mensagem de resposta
- [ ] mensagem de resposta em grupo
- [ ] mensagem encaminhada
- [ ] mensagem encaminhada em grupo
- [ ] mensagem de contato
- [ ] mensagem de contato em grupo
- [ ] mensagem de localização
- [ ] mensagem de localização em grupo
- [ ] mensagem de imagem
- [ ] mensagem de imagem em grupo
- [ ] mensagem de documento
- [ ] mensagem de documento em grupo
- [ ] mensagem de audio
- [ ] mensagem de audio em grupo
- [ ] mensagem de video
- [ ] mensagem de video em grupo

expecteds
- [ ] mensagem de texto
- [ ] mensagem de texto em grupo
- [ ] mensagem de resposta
- [ ] mensagem de resposta em grupo
- [ ] mensagem encaminhada
- [ ] mensagem encaminhada em grupo
- [ ] mensagem de contato
- [ ] mensagem de contato em grupo
- [ ] mensagem de localização
- [ ] mensagem de localização em grupo
- [ ] mensagem de imagem
- [ ] mensagem de imagem em grupo
- [ ] mensagem de documento
- [ ] mensagem de documento em grupo
- [ ] mensagem de audio
- [ ] mensagem de audio em grupo
- [ ] mensagem de video
- [ ] mensagem de video em grupo