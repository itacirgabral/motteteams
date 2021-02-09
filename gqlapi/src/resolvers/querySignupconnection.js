const crypto = require('crypto')
const qr = {
  type: 'qr',
  qr: '1@JmcciH4ex8Mi3X3VLm+le+zeWJtTbL2I6HvLReHieByl+VvM2GQvLQm4Wb0OVeMntm7vJGA/7YCGKw==,Z+Bkg8RbkDZ0TA2qugaZervpOJ0k+EgbV27X0ddtYS4=,dySLIPDeon0mvDP+euM32g==',
  attempts: 5
}

const querySignupconnection = async (parent, args, context, info) => {
  const { webhook, remember } = args.input
  const mark = crypto.randomBytes(8).toString('base64')

  const redis = context.redis.duplicate()
  const hardid = context.hardid

  const queueback = `tempzap:${mark}:qr`
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

module.exports = querySignupconnection
