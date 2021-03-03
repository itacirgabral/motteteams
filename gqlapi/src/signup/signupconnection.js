const crypto = require('crypto')

const signupconnection = async (parent, args, context, info) => {
  const { webhook, remember } = args.input
  const randomBytes = crypto.randomBytes(8).toString('base64')

  const redis = context.redis.duplicate()
  const hardid = context.hardid

  const queueback = `tempzap:${randomBytes}:qr`
  const blpopP = redis.blpop(queueback, 20)

  const type = 'gql.signupconnection'
  const bread = JSON.stringify({
    hardid,
    queueback,
    type,
    webhook,
    remember,
    selflog: true
  })

  await context.redis.publish(context.panoptickey, bread)

  const blpop = await blpopP

  const r = JSON.parse(blpop[1])

  return r
}

module.exports = signupconnection
