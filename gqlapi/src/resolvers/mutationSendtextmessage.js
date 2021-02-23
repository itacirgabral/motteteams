const { AuthenticationError } = require('apollo-server')

const timeout = Number(process.env.TIMEOUT || '5000')

const mutationSendtextmessage = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const { to, msg, quote } = args.input
    const radiohookkey = `zap:${context.user.shard}:radiohook`
    const rawbreadkey = `zap:${context.user.shard}:fifo:rawBread`

    const type = 'textMessage_v001'
    const random = String(Math.random()).slice(2)
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
        if (type === 'sent' && mark === random) {
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
      mark: random,
      jid,
      quote,
      msg
    }))

    return queryResult
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = mutationSendtextmessage
