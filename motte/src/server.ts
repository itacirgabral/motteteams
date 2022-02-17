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
            console.log('respondercomtextosimples')
            /**
             * GAMBIARRA PRO THIAGO
             * APRESENTAR QUINTA FEIRA
             */
            wacPC({
              type: 'sendTextMessage',
              hardid: bread.hardid,
              shard: bread.shard,
              to: bread.to,
              msg: bread.msg,
              cacapa: bread.cacapa
            })
            break
          case 'sendReadReceipt':
            console.log('sendReadReceipt')
            wacPC({
              type: 'sendReadReceipt',
              hardid: bread.hardid,
              shard: bread.shard,
              from: bread.from,
              participant: bread.participant,
              wid: bread.wid
            })
            break
          case 'sendPresenceAvailable':
            console.log('sendPresenceAvailable')
            wacPC({
              type: 'sendPresenceAvailable',
              hardid: bread.hardid,
              shard: bread.shard,
              jidto: bread.jidto,
            })
            break
          case 'getallchats':
            console.log('getallchats')
            wacPC({
              type: 'getallchats',
              hardid: bread.hardid,
              shard: bread.shard
            })
            break
          case 'getchatinfo':
            console.log('getchatinfo')
            wacPC({
              type: 'getchatinfo',
              hardid: bread.hardid,
              shard: bread.shard,
              chat: bread.chat,
              cacapa: bread.cacapa
            })
            break
          case 'sendFileMessage':
            console.log('sendFileMessage')
            /**
             * GAMBIARRA PRO THIAGO
             * APRESENTAR QUINTA FEIRA
             */
            wacPC({
              type: 'sendFileMessage',
              hardid: bread.hardid,
              shard: bread.shard,
              to: bread.to,
              link: bread.link,
              filename: bread.filename,
              mimetype: bread.mimetype,
              cacapa: bread.cacapa
            })
            break
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