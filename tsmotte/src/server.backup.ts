import { redis } from './redis'
import { panoptickey } from './rediskeys'
import { stream2bread } from './stream2bread'

const isProduction = process.env.NODE_ENV === 'production'

const trafficwand = async function () {
  const redisBlock = redis.duplicate()
  let sisyphus = true
  let lastlogid = '$'

  while (sisyphus) {
    try {
      const stream = await redisBlock.xread('BLOCK', 0, 'COUNT', 1, 'STREAMS', panoptickey, lastlogid)

      for (const county of stream) {
        const countyHead = county[0]
        const countyBody = county[1]

        for (const log of countyBody) {
          const logHead = log[0]
          const logBody = log[1]

          lastlogid = logHead

          const bread = stream2bread({ log: logBody })

          // console.log(JSON.stringify(bread, null, 2))

          // 4 rxjs fifo ofif offi foif

        }
      }
    } catch (err) {
      sisyphus = isProduction ? true : false
      console.error(err)
    }
  }
}

trafficwand()