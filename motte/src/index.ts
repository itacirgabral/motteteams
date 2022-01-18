import { Signupconnection, Connect } from '@gmapi/types'
import http from 'http'
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
  /**
   * INICIA NOVO PROCESSO
   * PRINCIPAL DO CONDADO
   */
  const { inBound } = mkServer()

  const healthPort = Number(process.env.HEALT_PORT) || 8538

  let n = 0
  // chech consul health
  const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      ok: true,
      n: n++
    }))
  })
  server.listen(healthPort)

  // Serviço Novo QR CODE
} else if (process.env.SERVICE === 'zygote') {
  console.log('isZygote')
  /**
   * INICIA NOVO PROCESSO
   * PARA CADASTRAR NOVA CONEXÃO
   */
  
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
  /**
   * INICIA NOVO PROCESSO
   * PARA MANTER UMA CONEXÃO
   */

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