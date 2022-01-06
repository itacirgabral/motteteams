import { Redis } from 'ioredis'
import { Observable } from 'rxjs'

type Bread = {
  [key: string]: string;
}

const stream2bread = function stream2bread ({ log }: { log: Array<string>}): Bread {
  const keys = log.filter((_el, i) => i % 2 === 0)
  const values = log.filter((_el, i) => i % 2 !== 0)

  const bread: Bread = {}
  for (let i = 0; i < keys.length; i++) {
    bread[keys[i] || ''] = values[i] || ''
  }

  return bread
}

const trafficwand = function trafficwand ({ redis, streamkey }: { redis: Redis, streamkey: string }) {
  return new Observable<Bread>(subscriber => {
    const redisBlock = redis.duplicate()
    let lastlogid = '$'
    ;(async () => {
      while (true) {
        const stream = await redisBlock.xread('BLOCK', 0, 'STREAMS', streamkey, lastlogid)
        for (const county of stream) {
          // const countyHead = county[0]
          const countyBody = county[1]
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
}

export {
  trafficwand,
  Bread,
  stream2bread
}
