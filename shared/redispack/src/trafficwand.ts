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

const trafficwand = function trafficwand ({ redis, streamkey, replay = false }: { redis: Redis, streamkey: string, replay?: boolean }) {
  return new Observable<Bread>(subscriber => {
    const redisBlock = redis.duplicate()
    let lastlogid = replay ? '0' : '$'
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

const trafficwandGen = async function * trafficwandGen ({ redis, streamkey, startAt = '$', stopAt }: { redis: Redis; streamkey: string; startAt?: string; stopAt?: string }) {
  const redisBlock = redis.duplicate()
  let lastlogid = startAt
  let ends = false
  while (!ends) {
    const stream = await redisBlock.xread('BLOCK', 0, 'STREAMS', streamkey, lastlogid)
    for (const county of stream) {
      // const countyHead = county[0]
      const countyBody = county[1]
      for (const log of countyBody) {
        const logHead = log[0]
        const logBody = log[1]
        lastlogid = logHead

        if (!stopAt) {
          const bread = stream2bread({ log: logBody })
          yield bread
        } else if (lastlogid.localeCompare(stopAt) === 1) {
          const bread = stream2bread({ log: logBody })
          yield bread
        } else {
          ends = true
        }
      }
    }
  }
}

export {
  trafficwand,
  trafficwandGen,
  Bread,
  stream2bread
}
