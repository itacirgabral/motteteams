import { Redis  } from 'ioredis'
import { Observable } from 'rxjs'
import { stream2bread, Bread } from './stream2bread'
// import { ConnAdm } from './schema'

const trafficwand = function trafficwand ({ redis, panoptickey}: { redis: Redis, panoptickey: string }, cb: (err: Error | null, bread: Bread | null) => void) {
  const redisBlock = redis.duplicate()

    const next = ({ panoptickey, lastlogid }: { panoptickey: string, lastlogid: string}) => {
    redisBlock.xread('BLOCK', 0, 'STREAMS', panoptickey, lastlogid, function(err, stream) {
      if (err) {
        cb(err, null)
      } else {
        for (const county of stream) {
          const countyHead = county[0]
          const countyBody = county[1]
    
          for (const log of countyBody) {
            const logHead = log[0]
            const logBody = log[1]
            
            // lastlogid = logHead
    
            const bread = stream2bread({ log: logBody })
            cb(null, bread)
            next({ panoptickey, lastlogid: logHead })
          }
        }
      }
    })
  }

  next({ panoptickey, lastlogid: '$'})
  // 
}

export {
  trafficwand
}
