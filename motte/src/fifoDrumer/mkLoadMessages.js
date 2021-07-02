const delay = require('./delay')

const mkLoadMessages = ({
  spreadkey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, count = 1, wid } = crumb

  let messages
  delay(100)

  if (wid) {
    const wbis1 = await seed.conn.loadMessages(jid, count, { fromMe: false, id: wid })
    delay(100)
    const wbis2 = await seed.conn.loadMessages(jid, count, { fromMe: true, id: wid })

    messages = wbis1.messages
      .concat(wbis2.messages)
      .map(message => message.toJSON())
  } else {
    const loaded = await seed.conn.loadMessages(jid, count)
    messages = loaded.messages.map(message => message.toJSON())
  }

  const pipeline = seed.redis.pipeline()
  messages
    .map(m => ({
      ...m,
      isFromHistory: true,
      isFromMe: m?.key?.fromMe
        ? true
        : undefined
    }))
    .map(JSON.stringify)
    .forEach(el => {
      pipeline.publish(spreadkey, el)
    })

  pipeline.ltrim(lastRawKey, 0, -2)
  await pipeline.exec()
}

module.exports = mkLoadMessages
