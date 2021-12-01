
# nova mensagem um um chat conhecido
```typescript
connect.ev.on('messages.upsert', ({ messages, type }) => {
  console.log('connect messages.upsert')
  console.dir({ messages, type })

  const onlyMessage = messages
    .filter(el => !el.messageStubType)
    .filter(el => !el.status)

  if (onlyMessage.length > 0) {
    const jids = new Set()
    onlyMessage.forEach(message => {
      if(message.key.remoteJid) {
        jids.add(message.key.remoteJid)
      }
    })
    console.log(JSON.stringify(Array.from(jids), null, 2))
  }
```
- [x] npm run start test | tee on_newchat.log
- [x] npm run start test | tee on_newmsg.log
- [x] npm run start test | tee on_delchat.log
- [x] npm run start test | tee on_newgroup.log
- [x] npm run start test | tee on_newmsggroup.log
- [ ] npm run start test | tee off_newchat.log
- [ ] npm run start test | tee off_newmsg.log
- [ ] npm run start test | tee off_delchat.log
- [ ] npm run start test | tee off_newgroup.log
- [ ] npm run start test | tee off_newmsggroup.log