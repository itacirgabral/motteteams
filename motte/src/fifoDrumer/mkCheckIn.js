const delay = require('./delay')

const mkLoadMessages = ({
  spreadkey,
  messageAscKey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  const messages = await seed.conn.loadAllUnreadMessages()
  const formatedMessages = messages
    .map(message => message.toJSON())
    .map(m => ({ ...m, isFromCheckin: true }))

  const pipeline = seed.redis.pipeline()

  // enviar essas mensagens
  formatedMessages
    .map(JSON.stringify)
    .forEach(el => pipeline.publish(spreadkey, el))

  // salvar wid no messageAsc
  formatedMessages
    .map(el => ({ wid: el.key.id, score: el.messageTimestamp }))
    .forEach(({ wid, score }) => pipeline.zadd(messageAscKey, 'NX', score, wid))

  await pipeline.exec()

  // marca como lido
  const readChats = formatedMessages.reduce((acc, el) => {
    const jid = el.key.remoteJid
    acc.add(jid)

    return acc
  }, new Set())

  for (const jid of readChats) {
    delay(100 * (1 + Math.random()))
    await seed.conn.chatRead(jid).catch(() => {})
  }

  await seed.redis.ltrim(lastRawKey, 0, -2)
}

module.exports = mkLoadMessages
