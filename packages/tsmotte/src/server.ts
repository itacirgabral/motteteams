import { client as redis, mkcredskey, panoptickey, trafficwand, Bread } from '@gmapi/redispack'
import { Observable } from 'rxjs'
import { zygotePC } from './zygote'
import { wacPC  } from './wac'
import { isConnAdm } from '@gmapi/types'
import { Connect } from '@gmapi/types'

let server: {
  inBound: Observable<Bread>;
}

const mkServer = function mkServer () {
  if (!server) {
    const observable = trafficwand({ redis, streamkey: panoptickey })

    observable.subscribe({
      next: bread => {
        console.log(`server.ts[${bread.type}]`)
        switch (bread.type) {
          case 'connect':
            if (isConnAdm.isConnect(bread)) {
              redis.get(mkcredskey({ shard: bread.shard })).then(auth => {
                if(auth) {
                  bread.auth = auth
                  wacPC(bread)
                } else {
                  console.log('lost auth')
                }
              })
            }
            break
          case 'connectionstate':
            if (isConnAdm.isConnectionstate(bread)) {
              wacPC(bread)
            }
            break
          case 'disconnect':
            if (isConnAdm.isDisconnect(bread)) {
              wacPC(bread)
            }
            break
          case 'signupconnection':
            if (isConnAdm.isSignupconnection(bread)) {
            zygotePC(bread)
              .then(birth => {
                if (bread.shard === birth.shard) {
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
            }
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