import { redis } from './redis'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'

const observable = trafficwand({ redis, panoptickey })

observable.subscribe({
  next: bread => {
    switch (bread.type) {
      case 'connect':
        console.dir({ bread })
        break
      case 'connectionstate':
        console.dir({ bread })
        break
      case 'disconnect':
        console.dir({ bread })
        break
      case 'queuerestart':
        console.dir({ bread })
        break
      case 'signupconnection':
        console.dir({ bread })
        break
      case 'spreadrestart':
        console.dir({ bread })
        break
      default:
        console.error({ bread })
    }
  },
  error: console.error,
  complete: () => console.log('done')
})