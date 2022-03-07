import { client as redis, mkfifokey, panoptickey, trafficwandGen, Bread } from '@gmapi/redispack'
import { zygotePC } from './zygote'
import { wacPC  } from './wac'
import { isConnAdm } from '@gmapi/types'
import { Connect } from '@gmapi/types'

let singleOne = false

const mkServer = async function mkServer () {
  if (!singleOne) {
    // const observable = trafficwand({ redis, streamkey: panoptickey })
    const breads = trafficwandGen({ redis, streamkey: panoptickey })
    singleOne = true

    for await (const bread of breads) {
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
          redis.xadd(mkfifokey({ shard: bread.shard }), '*',
          'hardid', bread.hardid,
          'type', 'sendTextMessage',
          'shard', bread.shard,
          'to', bread.to,
          'msg', bread.msg,
          'cacapa', 'random123').catch(console.error)
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
        case 'respondercomarquivo':
          redis.xadd(mkfifokey({ shard: bread.shard }), '*',
            'hardid', bread.hardid,
            'type', 'sendFileMessage',
            'shard', bread.shard,
            'to', bread.to,
            'link', bread.link,
            'mimetype', bread.mimetype,
            'filename', bread.filename,
            'cacapa', 'random123').catch(console.error)
        break
        case 'respondercomescolhas':
          redis.xadd(mkfifokey({ shard: bread.shard }), '*',
          'hardid', bread.hardid,
          'type', 'sendButtons',
          'shard', bread.shard,
          'to', bread.to,
          'msg', bread.msg,
          'options', bread.options,
          'cacapa', 'random123').catch(console.error)
        break
        default:
          console.log('redis:stream -> switch ?')
          console.error(bread)
      }
    }
  }
}

export {
  mkServer
}