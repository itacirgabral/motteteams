import { fork } from 'child_process'
import { Connect, Disconnect, Connectionstate, isConnAdm } from 'types'
import { patchpanel } from './patchpanel'
import baileys from '@adiwajshing/baileys-md'
import { BufferJSON, WABrowserDescription, initInMemoryKeyStore  } from '@adiwajshing/baileys-md'
import { client as redis, mkcredskey } from 'redispack'

type ConnectionSwitch = Connect | Disconnect | Connectionstate

/**
 * Whats App Connect
 * @param connect 
 * @returns 
 */
const wac = function wac (connect: Connect): Promise<string> {
  return new Promise((res, rej) => {
    if(connect.type === 'connect' && isConnAdm.isConnect(connect)) {
      console.log('iniciando o processo BAILEY CONNECT')
      const browser: WABrowserDescription = ['GMAPI2', 'Chrome', '95']
      const authJSON = JSON.parse(connect.auth || '{}', BufferJSON.reviver)
      const auth = { 
        creds: authJSON.creds, 
        keys: initInMemoryKeyStore(authJSON.keys) 
      }

      const socket = baileys({
        auth,
        browser
      })

      socket.ev.on ('auth-state.update', () => {
        const authInfo = socket.authState
        const authJson = JSON.stringify(authInfo, BufferJSON.replacer, 2)

        const user = socket.user
        const shard= user.id.split(':')[0]

        redis.set(mkcredskey({ shard }), authJson)
          .then(() => {
            res(shard)
          })
      })
    } else {
      rej("connectionSwitch.type === 'connect' && isConnect(connectionSwitch)")
    }
  })
}

const wacPC = (connectionSwitch: ConnectionSwitch) => {
  switch (connectionSwitch.type) {
    case 'connect':
      if (isConnAdm.isConnect(connectionSwitch) && !patchpanel.has(connectionSwitch.shard)) {
        const { type, hardid, shard, cacapa, auth } = connectionSwitch
        console.log('wacPC connect')
        // WhatsApp Connection Process 
        const wacP = fork('./src/index', {
          env: {
            ...process.env,
            SERVICE: 'wac',
            type,
            hardid,
            shard,
            cacapa,
            auth
          }
        })

        patchpanel.set(connectionSwitch.shard, {
          connected: false,
          connecting: true,
          wacP
        })

        wacP.on('close', el => {
          console.log('wacP close')
          patchpanel.delete(connectionSwitch.shard)
          console.dir(el)
        })
        wacP.on('disconnect',  () => {
          console.log('wacP disconnect')
        })
        wacP.on('listening', el => {
          console.log('wacP listening')
          console.dir(el)
        })
        wacP.on('message', (el: string) => {
          // update patchpanel state
          const { type, ...body } = JSON.parse(el)
          switch (type) {
            case 'SHUTDOWN_ME':
              patchpanel.delete(shard)  
              wacP.kill('SIGINT')
              break
            default:
              console.log('wacP message')
              console.dir(el)
              break
          }
        })
        wacP.on('error', el => {
          console.log('wacP error')
          console.dir(el)
        })
        wacP.on('exit', el => {
          console.log('wacP exit')
          console.dir(el)
        })
      }
      break
    case 'connectionstate':
      console.log('wacPC connectionstate')
      if (isConnAdm.isConnectionstate(connectionSwitch)) {
        const { type, shard, hardid, cacapa } = connectionSwitch
        if (patchpanel.has(shard)) {
          const blueCable = patchpanel.get(shard)
          console.log(`connectionstate=${blueCable?.connected ? 'connected' : 'connecting'}`)
        } else {
          console.log('connectionstate trashed')
        }
      }
      break
    case 'disconnect':
      if (isConnAdm.isDisconnect(connectionSwitch)) {
        // mata processo
        const { type, hardid, shard, cacapa } = connectionSwitch
        if (patchpanel.has(shard)) {
          const blueCable = patchpanel.get(shard)
          if (blueCable && (blueCable.connected || blueCable.connecting)) {
            // kill now
            // patchpanel.delete(shard)  
            blueCable.wacP.kill('SIGINT')
          }
        }
      }
      break
  }
}

export {
  wac,
  wacPC
}