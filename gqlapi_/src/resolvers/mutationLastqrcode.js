const mutationLastqrcode = async (parent, args, context, info) => {
  const { qr } = args.input
  const redis = context.redis.duplicate()

  const tempzapjwtkey = `tempzap:${qr}:jwt`

  const blpop = await redis.blpop(tempzapjwtkey, 20)

  if (blpop) {
    const bread = JSON.parse(blpop[1])

    return bread
  } else {
    return null
  }
}

module.exports = mutationLastqrcode
