import { Redis  } from 'ioredis'
import { Observable } from 'rxjs'
import { stream2bread } from './stream2bread'
import { ConnAdm, isConnAdm } from './schema'

const trafficwand = ({ redis, panoptickey }: { redis: Redis, panoptickey: string }) => new Observable<ConnAdm>(subscriber => {
  const redisBlock = redis.duplicate()
  let lastlogid = '$'
  ;(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const stream = await redisBlock.xread('BLOCK', 0, 'STREAMS', panoptickey, lastlogid)
      for (const county of stream) {
        // const countyHead = county[0]
        const countyBody = county[1]

        // console.log(`countyHead=${countyHead}`)

        for (const log of countyBody) {
          const logHead = log[0]
          const logBody = log[1]
          lastlogid = logHead
  
          const bread = stream2bread({ log: logBody })
          switch (bread.type) {
            case 'signupconnection':
              if (isConnAdm.isSignupconnection(bread)) {
                subscriber.next(bread)
              }
              break;
            case 'connect':
              if (isConnAdm.isConnect(bread)) {
                subscriber.next(bread)
              }
              break;
            case 'queuerestart':
              if (isConnAdm.isQueuerestart(bread)) {
                subscriber.next(bread)
              }
              break;
            case 'spreadrestart':
              if (isConnAdm.isSpreadrestart(bread)) {
                subscriber.next(bread)
              }
              break;
            case 'connectionstate':
              if (isConnAdm.isConnectionstate(bread)) {
                subscriber.next(bread)
              }
              break;
            case 'disconnect':
              if (isConnAdm.isDisconnect(bread)) {
                subscriber.next(bread)
              }
              break;
            default:
          }
          
        }
      }
    }
  })()
})

export {
  trafficwand
}
