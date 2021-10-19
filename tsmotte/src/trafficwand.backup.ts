import { Redis  } from 'ioredis'
import { Observable } from 'rxjs';
import { stream2bread, Bread } from './stream2bread'
import { ConnAdm } from './schema'

const trafficwand = function trafficwand ({ redis, panoptickey}: { redis: Redis, panoptickey: string }) {
  const redisBlock = redis.duplicate()

  const observable = new Observable<Bread>(subscriber => {
    redisBlock.xreadgroup('GROUP', 'tsmotte', 'COUNT', 1, 'NOACK', 'STREAMS', panoptickey, '>', (err, stream) => {
      console.error(err)
      if(err) {
        subscriber.error(err)
      } else {
        console.dir({ stream })
        for (const county of stream) {
          const countyHead = county[0]
          const countyBody = county[1]
    
          for (const log of countyBody) {
            const logHead = log[0]
            const logBody = log[1]
    
            const bread = stream2bread({ log: logBody })
    
            console.log('subscriber.next(bread)')
            subscriber.next(bread)
          }
        }
      }

    })
  })

  return observable
}

export {
  trafficwand
}

// redisBlock.xadd('BLOCK', 0, 'COUNT', 1, 'STREAMS', panoptickey, lastlogid)
// .then(stream => {
//   for (const county of stream) {
//     const countyHead = county[0]
//     const countyBody = county[1]

//     for (const log of countyBody) {
//       const logHead = log[0]
//       const logBody = log[1]

//       lastlogid = logHead

//       const bread = stream2bread({ log: logBody })
//       subscriber.next(bread)
//     }
//   }
// })