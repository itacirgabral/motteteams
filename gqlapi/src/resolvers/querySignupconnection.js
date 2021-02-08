const qr = {
  type: 'qr',
  qr: '1@JmcciH4ex8Mi3X3VLm+le+zeWJtTbL2I6HvLReHieByl+VvM2GQvLQm4Wb0OVeMntm7vJGA/7YCGKw==,Z+Bkg8RbkDZ0TA2qugaZervpOJ0k+EgbV27X0ddtYS4=,dySLIPDeon0mvDP+euM32g==',
  attempts: 5
}

const querySignupconnection = async (parent, args, context, info) => {
  const { webhook, remember } = args.input

  const r = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(qr)
    }, 2000)
  })

  return r
}

module.exports = querySignupconnection
