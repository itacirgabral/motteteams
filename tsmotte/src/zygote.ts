import { AuthenticationState, BufferJSON, initInMemoryKeyStore } from '@adiwajshing/baileys-md'
import baileys from '@adiwajshing/baileys-md'
import { readFile, writeFile } from "fs"
import pino from 'pino'

import { redis } from './redis'
import { panoptickey } from './rediskeys'
import { Signupconnection } from './schema/ConnAdm'

const loadState = function loadState (): Promise<AuthenticationState> {
  return new Promise((resolve, rejects) => {
    readFile('./auth_info_multi.json', { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        rejects(err)
      } else {
        const value = JSON.parse(data, BufferJSON.reviver)
        resolve({ 
          creds: value.creds, 
          keys: initInMemoryKeyStore(value.keys) 
      })
      }
    })
  })
}

const saveState = function saveState (state: AuthenticationState) {
  return new Promise((resolve, rejects) => {
    const value = JSON.stringify(state, BufferJSON.replacer, 2)
    writeFile('./auth_info_multi.json', value, (err) => {
      if (err) {
        rejects(err)
      } else {
        resolve(value)
      }
    })
  })
}


const zygote = function zygote (signupconnection: Signupconnection): void {
  const { mitochondria, shard, url, cacapa } = signupconnection

  console.dir({ mitochondria, shard, url, cacapa })

  let socket = baileys({
    logger: pino({ level: 'trace' }),
    printQRInTerminal: true
  })

  socket.ev.on('connection.update', async (update) => {
    if(update.connection === 'close') {
      const auth = await loadState()
      socket = baileys({
        logger: pino({ level: 'trace' }),
        printQRInTerminal: true,
        auth
      })

      console.log('logando uma segunda vez')
    }
  })

  socket.ev.on ('auth-state.update', async () => {
    const authInfo = socket.authState
    await saveState(authInfo)
  })

}

export {
  zygote
}