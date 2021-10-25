import { BufferJSON, WABrowserDescription } from '@adiwajshing/baileys-md'
import baileys from '@adiwajshing/baileys-md'

import { redis } from './redis'
import { mkcredskey } from './rediskeys'
import { Signupconnection } from './schema/ConnAdm'


const zygote = function zygote (signupconnection: Signupconnection): void {
  const { mitochondria, shard, url, cacapa } = signupconnection

  const browser: WABrowserDescription = ['BROODERHEN', 'Chrome', '95'] 

  // TODO enviar qrcode na e url cacapa
  const socket = baileys({
    printQRInTerminal: true,
    browser
  })
  socket.ev.on('connection.update', async (update) => {
    if(update.connection === 'close') {
      console.log('logando uma segunda vez')
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
            console.log('hora de dar tchau')

            // TODO enviar o jwt para url e pra fila qrcode ttl
          } else {
            console.log(`ops shard=${shard}<>${jid}=jid`)
          }
        }, 5000)
      })
    }
  })
}

export {
  zygote
}