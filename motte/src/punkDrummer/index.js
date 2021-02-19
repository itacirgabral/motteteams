const punkDrummer = (seed) => {
  const keys = {
    panoptickey: 'zap:panoptic',
    spreadKey: `zap:${seed.shard}:spread`
  }
  const healthcare = {
    playing: true,
    fifoRawKey: keys.fifoRawKey,
    lastRawKey: keys.lastRawKey
  }

  // subscribe
  seed.redisB.subscribe(keys.spreadKey)
  seed.redisB.on('message', async (channel, message) => {
    if (healthcare.playing) {
      const wbi = JSON.parse(message)
      console.dir({ wbi })
    } else {
      seed.redisB.unsubscribe(keys.spreadKey)
    }
  })

  return healthcare
}

module.exports = punkDrummer
