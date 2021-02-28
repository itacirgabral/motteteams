const { AuthenticationError, UserInputError } = require('apollo-server-express')

const timeout = Number(process.env.TIMEOUT || '5000')

const sendtextmessage = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const { to, msg, quote } = args.input
    const radiohookkey = `zap:${context.user.shard}:radiohook`
    const rawbreadkey = `zap:${context.user.shard}:fifo:rawBread`
    const chatsKeys = `zap:${context.user.shard}:chats`
    const markcountkey = `zap:${context.user.shard}:markcount`

    const pipeline = context.redis.pipeline()
    pipeline.sismember(chatsKeys, to)
    pipeline.incr(markcountkey)
    const pipeback = await pipeline.exec()

    const alreadyTalkedTo = pipeback[0][1]
    const mark0 = pipeback[1][1]

    if (alreadyTalkedTo) {
      const type = 'textMessage_v001'
      const jid = to.indexOf('-') === -1
        ? `${to}@s.whatsapp.net` // se for pessoa
        : `${to}@g.us` // se for grupo

      await redisB.subscribe(radiohookkey)
      const queryResult = new Promise((resolve, reject) => {
        setTimeout(() => {
          redisB.unsubscribe(radiohookkey)
          resolve()
        }, timeout)

        redisB.on('message', (channel, message) => {
          const { type, mark, wid, timestamp, from } = JSON.parse(message)
          if (type === 'sent' && mark === mark0) {
            redisB.unsubscribe()
            resolve({
              wid,
              timestamp,
              to,
              from,
              msg,
              quote,
              forwarded: false
            })
          }
        })
      })

      // o comando de envio de mensagem
      await context.redis.lpush(rawbreadkey, JSON.stringify({
        type,
        mark: mark0,
        jid,
        quote,
        msg
      }))

      return queryResult
    } else {
      throw new UserInputError('Never seen before.')
    }
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = sendtextmessage
