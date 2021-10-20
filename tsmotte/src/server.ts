import { redis } from './redis'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'

const observable = trafficwand({ redis, panoptickey })

observable.subscribe({
  next: bread => {
    console.log(JSON.stringify(bread, null, 2))
  },
  error: console.error,
  complete: () => console.log('done')
})