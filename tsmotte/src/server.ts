import { redis } from './redis'
import { Observable } from 'rxjs'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'
import { zygotePC } from './zygote'
import { ConnAdm } from './schema'

let server: {
  inBound: Observable<ConnAdm>;
}

const mkServer = function mkServer () {
  if (!server) {
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
            zygotePC(bread)
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

    server = {
      inBound: observable
    }
  }

  return server
}

export {
  mkServer
}