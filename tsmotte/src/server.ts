import { redis } from './redis'
import { panoptickey } from './rediskeys'

const isProduction = process.env.NODE_ENV === 'production'

const trafficwand = async function () {
  const redisBlock = redis.duplicate()
  let sisyphus = true
  const lastlogid = '$'

  while (sisyphus) {
    try {
      const stream = await redisBlock.xread('BLOCK', 0, 'COUNT', 1, 'STREAMS', panoptickey, lastlogid)

      for (const county of stream) {
        const countyHead = county[0]
        const countyBody = county[1]

        console.dir({ countyHead, countyBody })

        for (const log of countyBody) {
          const logHead = log[0]
          const logBody = log[1]

          console.dir({ logHead, logBody })
        }
      }
    } catch (err) {
      sisyphus = isProduction ? true : false
      console.error(err)
    }
  }
}

trafficwand()