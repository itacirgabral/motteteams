import { fork } from 'child_process'
import { BufferJSON, WABrowserDescription } from '@adiwajshing/baileys-md'
import baileys from '@adiwajshing/baileys-md'

import { redis } from './redis'
import { mkcredskey } from './rediskeys'
import { Signupconnection } from './schema/ConnAdm'

const zygote = function zygote (signupconnection: Signupconnection) {
  return new Promise((res, rej) => {
    const { mitochondria, shard, url, cacapa } = signupconnection

    const browser: WABrowserDescription = ['BROODERHEN', 'Chrome', '95'] 
  
    // TODO enviar qrcode na e url cacapa
    const socket = baileys({
      printQRInTerminal: true,
      browser
    })
    socket.ev.on('connection.update', async (update) => {
      if(update.connection === 'close') {
        console.log('zgt logando uma segunda vez')
        const user = socket.user
        console.dir({ user })
        const socket2 = baileys({
          auth: socket.authState,
          browser
        })
        socket2.ev.on ('auth-state.update', () => {
          setTimeout(async () => {
            const user = socket2.user
            const jid = user.id.split(':')[0]
            if (jid === shard) {
              const authInfo = socket2.authState
              const value = JSON.stringify(authInfo, BufferJSON.replacer, 2)
              await redis.set(mkcredskey({ shard }), value)
              await socket2.logout()
  
              // TODO enviar o jwt para url e pra fila qrcode ttl
              // TODO criar borns com mitocondria
  
              res({ jwt: 'xxx.yyy.zzz' })
  
            } else {
              console.log()
              rej(`ops shard=${shard}<>${jid}=jid`)
            }

            // Caso seja um subprocesso, sair
            if (process.send) {
              process.send('zgt hora de dar tchau')
              process.exit()
            }
          }, 4000)
        })
      }
    })
  })
}


const zygotePC = function zygotePC (signupconnection: Signupconnection) {
  const { type, hardid, mitochondria, shard, url, cacapa } = signupconnection
  const zgt = fork('./src/index', {
    env: {
      ...process.env,
      SERVICE: 'zygote',
      type,
      hardid,
      mitochondria,
      shard,
      url,
      cacapa
    }
  })

  zgt.on('close', el => {
    console.log('zgt close')
    console.dir(el)
  })
  zgt.on('disconnect',  () => {
    console.log('zgt disconnect')
  })
  zgt.on('listening', el => {
    console.log('zgt listening')
    console.dir(el)
  })
  zgt.on('message', el => {
    console.log('zgt message')
    console.dir(el)
  })
  zgt.on('error', el => {
    console.log('zgt error')
    console.dir(el)
  })
  zgt.on('exit', el => {
    console.log('zgt exit')
    console.dir(el)
  })
}

export {
  zygote,
  zygotePC
}