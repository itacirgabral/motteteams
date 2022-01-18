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
              wacPC(bread)
              // redis.get(mkcredskey({ shard: bread.shard })).then((auth: string) => {
              //   if(auth) {
              //     bread.auth = auth
              //     wacPC(bread)
              //   } else {
              //     console.log('lost auth')
              //   }
              // })
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
                if (birth.shard === 'nops') {
                  // avisa na caçapa que deu errado
                  console.log('avisa na caçapa que NOPS')
                } else {
                  const auth = `./auth_info_multi/${birth.shard}.json`
                  const letsConn: Connect = {
                    type: 'connect',
                    cacapa: birth.auth,
                    hardid: bread.hardid,
                    shard: birth.shard,
                    auth
                  }
                  wacPC(letsConn)
                }
              })
            }
            break
          case 'respondercomtextosimples':
            // BUG SEM VALIDAÇÃO
            // qual whats
            // qual destinatário
            // qual mensagem
            console.log('respondercomtextosimples')
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