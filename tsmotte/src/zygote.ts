import { redis } from './redis'
import { panoptickey } from './rediskeys'
import makeWASocket from '@adiwajshing/baileys-md'

import { Signupconnection } from './schema/ConnAdm'

const zygote = function zygote (signupconnection: Signupconnection): void {
  const { mitochondria, shard, url, cacapa } = signupconnection

  console.dir({ mitochondria, shard, url, cacapa })

  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true
})
}

export {
  zygote
}