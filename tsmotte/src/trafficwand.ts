import { Redis  } from 'ioredis'
import { Observable } from 'rxjs'
import { stream2bread, Bread } from './stream2bread'
// import { ConnAdm } from './schema'

const trafficwand = ({ redis, panoptickey }: { redis: Redis, panoptickey: string }) => new Observable<Bread>(subscriber => {
  const redisBlock = redis.duplicate()
  let lastlogid = '$'
  ;(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const stream = await redisBlock.xread('BLOCK', 0, 'STREAMS', panoptickey, lastlogid)
      for (const county of stream) {
        const countyHead = county[0]
        const countyBody = county[1]

        // console.log(`countyHead=${countyHead}`)

        for (const log of countyBody) {
          const logHead = log[0]
          const logBody = log[1]
          lastlogid = logHead
  
          const bread = stream2bread({ log: logBody })
          
          subscriber.next(bread)
        }
      }
    }
  })()
})

export {
  trafficwand
}
