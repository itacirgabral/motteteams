import { redis } from './redis'
import { mkcredskey } from './rediskeys'
import { Observable } from 'rxjs'
import { panoptickey } from './rediskeys'
import { trafficwand } from './trafficwand'
import { zygotePC } from './zygote'
import { wacPC  } from './wac'
import { ConnAdm } from './schema'
import { Connect } from './schema/ConnAdm'

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
            redis.get(mkcredskey({ shard: bread.shard })).then(auth => {
              if(auth) {
                bread.auth = auth
                wacPC(bread)
              }
            })
            break
          case 'connectionstate':
          case 'disconnect':
            wacPC(bread)
            break
          case 'queuerestart':
            // console.dir({ bread })
            break
          case 'signupconnection':
            // quando fizer o signup
            // logo em seguida signin
            zygotePC(bread).then(birth => {
              if (bread.shard === birth.shard) {
                birth.auth
                const letsConn: Connect = {
                  type: 'connect',
                  cacapa: birth.qrcode,// só pra não jogar fora
                  hardid: bread.hardid,
                  shard: birth.shard,
                  auth: birth.auth
                }
                wacPC(letsConn)
              }
            })
            break
          case 'spreadrestart':
            console.dir({ bread })
            break
          default:
            console.log('redis:stream -> switch ?')
            console.error(bread)
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