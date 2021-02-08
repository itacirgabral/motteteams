const queryLastqrcode = async (parent, args, context, info) => {
  const { qr } = args.input

  const jwt = {
    type: 'jwt',
    jwt: 'xxx.yyy.zzz',
    userinfo: {
      number: '123412341234',
      name: 'name',
      avatar: 'https://avatares.com/123412341234'
    }
  }

  const r = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(jwt)
    }, 2000)
  })

  return r
}

module.exports = queryLastqrcode
