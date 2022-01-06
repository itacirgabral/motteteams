import { Signupconnection, Connect } from '@gmapi/types'
import { mkServer } from './server'
import { zygote } from './zygote'
import { wac } from './wac'

const isMain = !process.env.SERVICE

process.on('message', (message) => {
  console.log(`MAIN <- ${message}`)
})

// Pocesso principal
if (isMain) {
  console.log('isMain')
  const { inBound } = mkServer()


  // Serviço Novo QR CODE
} else if (process.env.SERVICE === 'zygote') {
  console.log('isZygote')
  // Recuperando variáveis na ENV
  const signupconnection: Signupconnection = {
    type: 'signupconnection',
    hardid: process.env.hardid || '',
    mitochondria: process.env.mitochondria || '',
    shard: process.env.shard || '',
    url: process.env.url || '',
    cacapa: process.env.cacapa || ''
  }

  console.log(`isZygote <:> Processo de Leitura de QRCode <:> mitochondria=${
    signupconnection.mitochondria
  } <:> shard=${
    signupconnection.shard
  }`)

  zygote(signupconnection)
    .then(el => {
      console.log(`isZygote <:> QRCode <:> mitochondria=${
        el.mitochondria
      } <:> shard=${
        el.shard
      } <:> jwt=${
        el.jwt
      }`)
    })
    .catch(console.error)
} else if (process.env.SERVICE === 'wac') {
  console.log('isWAC')

  const connect: Connect = {
    type: 'connect',
    hardid: process.env.hardid || '',
    shard: process.env.shard || '',
    cacapa: process.env.cacapa || '',
    auth: process.env.auth || ''
  }

  wac(connect)
    .then(el => {
      console.log(el)
      console.log(`isWAC <:> connect <:> hardid=${
        process.env.hardid
      } <:> shard=${
        process.env.shard
      }`)
    })
    .catch(console.error)
}