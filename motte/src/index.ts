import { Signupconnection, Connect } from '@gmapi/types'
import { mkServer } from './server'
import { zygote } from './zygote'
import { wac } from './wac'
// import rest from './rest'

const isMain = !process.env.SERVICE
const httpPort = process.env.HTTP_PORT || '8080'

// Pocesso principal
if (isMain) {
  console.log('isMain')
  /**
   * INICIA NOVO PROCESSO
   * PRINCIPAL DO CONDADO
   */
  mkServer().catch(console.error)

  // rest.listen(httpPort, () => {
  //   console.log(`⚡️[server]: Server is running at http://localhost:${httpPort}`)
  // })

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
    auth: process.env.auth || '',
    drummerStartAt: process.env.drummerStartAt || '',
    drummerStopAt: process.env.drummerStopAt || ''
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