import { Redis } from 'ioredis'
import Yallist from 'yallist'
import { setTimeout } from 'timers/promises'

type Bread = {
  [key: string]: string;
}

const stream2bread = function stream2bread({ log }: { log: Array<string> }): Bread {
  const keys = log.filter((_el, i) => i % 2 === 0)
  const values = log.filter((_el, i) => i % 2 !== 0)

  const bread: Bread = {}
  for (let i = 0; i < keys.length; i++) {
    bread[keys[i] || ''] = values[i] || ''
  }

  return bread
}

const trafficwandGen = async function* trafficwandGen({ redis, streamkey, startAt = '$', stopAt }: { redis: Redis; streamkey: string; startAt?: string; stopAt?: string }) {
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

const mkStepwand = ({ delay = 1000, delta = 200, breads = [] }: { delay?: number; delta?: number; breads?: Array<Bread> }) => {
  const indians = new Yallist<{ goodFor: number; bread: Bread }>()
  let dontStop = true

  for (const bread of breads) {
    indians.push({
      bread,
      goodFor: delay + Math.trunc(delta * (Math.random() - 0.5))
    })
  }

  const steps = () => indians.toArray().map(el => el.bread)
  const dates = () => indians.toArray().map(el => el.goodFor)

  let blockerResolve: (value: unknown) => void
  let blockerReject: (value: unknown) => void
  let blocker = new Promise((resolve, reject) => {
    blockerResolve = resolve
    blockerReject = reject
  })

  const close = () => {
    dontStop = false
    blockerReject(null)
  }

  const pub = (bread: Bread) => {
    indians.push({
      bread,
      goodFor: delay + Math.trunc(delta * (Math.random() - 0.5))
    })
    if (indians.length === 1) {
      blockerResolve(null)
    }
  }

  const pubOver = (bread: Bread) => {
    indians.unshift({
      bread,
      goodFor: delay + Math.trunc(delta * (Math.random() - 0.5))
    })
    if (indians.length === 1) {
      blockerResolve(null)
    }
  }

  const gen = async function* gen() {
    while (dontStop) {
      if (indians.head) {
        const sleepms = indians.head?.value.goodFor ?? 0
        await setTimeout(sleepms > delta ? sleepms : delta)
        const bread = indians.shift()?.bread
        if (bread && dontStop) {
          yield bread
        } else {
          dontStop = false
          console.log(`dontStop=${dontStop}`)
        }
      } else {
        await blocker
        blocker = new Promise((resolve, reject) => {
          blockerResolve = resolve
          blockerReject = reject
        })
      }
    }
  }

  return {
    pub,
    pubOver,
    gen,
    steps,
    dates,
    close
  }
}

export {
  trafficwandGen,
  Bread,
  stream2bread,
  mkStepwand
}
