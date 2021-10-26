import { Signupconnection } from './schema/ConnAdm'
import { mkServer } from './server'
import { zygote } from './zygote'

const isMain = !process.env.SERVICE

process.on('message', (message) => {
  console.log(`MAIN <- ${message}`)
})

// Pocesso principal
if (isMain) {
  console.log('isMain')
  const { inBound } = mkServer()
  console.dir({ inBound })

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
  zygote(signupconnection)
    .then(console.dir)
    .catch(console.error)
}
