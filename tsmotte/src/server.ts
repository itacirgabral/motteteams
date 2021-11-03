import { redis } from './redis'
import { Observable } from 'rxjs'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'
import { zygotePC } from './zygote'
import { wacPC  } from './wac'
import { ConnAdm } from './schema'
import { patchpanel } from './patchpanel'

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
            wacPC(bread)
            break
          case 'connectionstate':
            wacPC(bread)
            break
          case 'disconnect':
            wacPC(bread)
            break
          case 'queuerestart':
            // console.dir({ bread })
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