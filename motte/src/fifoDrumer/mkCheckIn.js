const mkLoadMessages = ({
  spreadkey,
  checkinkey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  const pipeline = seed.redis.pipeline()
  pipeline.get(checkinkey) // 0
  pipeline.ltrim(lastRawKey, 0, -2) // 1
  const pipeback = await pipeline.exec()

  const checkin = !pipeback[0][0] && pipeback[0][1] ? JSON.parse(pipeback[0][1]) : []

  for (const { jid, count } of checkin) {
    const loaded = await seed.conn.loadMessages(jid, count)
    const messages = loaded.messages.map(message => message.toJSON())

    const topunkdrummer = seed.redis.pipeline()
    messages
      .map(m => ({ ...m, isFromCheckin: true }))
      .map(JSON.stringify)
      .forEach(el => {
        topunkdrummer.publish(spreadkey, el)
      })

    await topunkdrummer.exec()
  }
}

module.exports = mkLoadMessages
