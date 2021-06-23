const mkLoadMessages = ({
  spreadkey,
  checkinkey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  
  const messages = await seed.conn.loadAllUnreadMessages()
  const formatedMessages = messages
    .map(message => message.toJSON())
    .map(m => ({ ...m, isFromCheckin: true }))

  // enviar essas mensagens
  console.dir(formatedMessages)

  const readChats = formatedMessages.reduce((acc, el) => {
    const chat = el.key.remoteJid.split('@')[0]
    acc.add(chat)

    return acc
  }, new Set())
  // marcar chats como lidos
  console.dir(readChats)

  // salvar wid no messageAsc
  const readWids = formatedMessages.map(el => el.key.id)
  console.dir(readWids)
}

module.exports = mkLoadMessages
