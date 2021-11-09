import { fork } from 'child_process'
import { Connect, isConnect, Disconnect, isDisconnect, Connectionstate, isConnectionstate } from './schema/ConnAdm'
import { patchpanel } from './patchpanel'
import baileys from '@adiwajshing/baileys-md'
import { BufferJSON, WABrowserDescription } from '@adiwajshing/baileys-md'
import { mkcredskey } from './rediskeys'
import { redis } from './redis'


type ConnectionSwitch = Connect | Disconnect | Connectionstate

/**
 * Whats App Connect
 * @param connect 
 * @returns 
 */
const wac = function wac (connect: Connect): Promise<string> {
  return new Promise((res, rej) => {
    if(connect.type === 'connect' && isConnect(connect)) {
      console.log('iniciando o processo BAILEY CONNECT')
      const browser: WABrowserDescription = ['GMAPI2', 'Chrome', '95']
      const auth = JSON.parse(connect.auth, BufferJSON.reviver)

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
            res('credenciais novas salvas')
          })
      })
    } else {
      rej("connectionSwitch.type === 'connect' && isConnect(connectionSwitch)")
    }
  })
}

const wacPC = (connectionSwitch: ConnectionSwitch) => {
  console.dir(connectionSwitch)
  switch (connectionSwitch.type) {
    case 'connect':
      if (isConnect(connectionSwitch) && !patchpanel.has(connectionSwitch.shard)) {
        const { type, hardid, shard, cacapa, auth } = connectionSwitch
        
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

        wacP.on('close', el => {
          console.log('wacP close')
          console.dir(el)
        })
        wacP.on('disconnect',  () => {
          console.log('wacP disconnect')
        })
        wacP.on('listening', el => {
          console.log('wacP listening')
          console.dir(el)
        })
        wacP.on('message', el => {
          if (el === 'SHUTDOWN_ME') {
            wacP.kill('SIGINT')
          }
          console.log('wacP message')
          console.dir(el)
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
      if (isConnectionstate(connectionSwitch)) {
        const { type, } = connectionSwitch
      }
      break
    case 'disconnect':
      if (isDisconnect(connectionSwitch)) {
        // mata processo 
      }
      break
  }
}

export {
  wac,
  wacPC
}