# TODO
## handlers
- [x] auth-state.update
- [x] blocklist.set
- [x] blocklist.update
- [x] chats.delete
- [x] chats.set
- [x] chats.update
- [x] chats.upsert
- [x] connection.update
- [x] contacts.upsert
- [x] group-participants.update
- [x] groups.update
- [x] message-info.update
- [x] messages.delete
- [x] messages.update
- [x] messages.upsert
- [x] presence.update

## contatos e grupos
- [x] zygote messages.upsert prepend
- [x] novos contatos
- [x] novos grupos

## receber mensagens
- [x] bindar o handler de entrada pras mensagens
- [x] um exemplo de json pra mensagem de texto
  - direto pessoal
  - no grupo
  - resposta
  - encaminhada
- [ ] pacote baileys2gmapi
- [ ] couchdb
- [ ] documento
- [ ] min.io
- [ ] contato, localização
- [ ] imagem, audio, video


## receber mensagens
A set of message IDs must be explicitly marked read now. Cannot mark an entire "chat" read as it were with Baileys Web. This does mean you have to keep track of unread messages.
