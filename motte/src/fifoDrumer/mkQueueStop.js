const mkQueueStop = ({
  spreadkey,
  messageAscKey,
  lastRawKey
}) => async ({ crumb, seed, healthcare }) => {
  const { t } = crumb

  if (Date.now() - t < 1000) {
    healthcare.playing = false
  }

  await seed.redis.ltrim(lastRawKey, 0, -2)
}

module.exports = mkQueueStop
