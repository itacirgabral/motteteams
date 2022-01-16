I'm using multiple process. There is a Main how just manager childrens, Signup process and one Connect process to each baileys instance.

> index.ts
```typescript
import { Signupconnection, Connect } from '@gmapi/types'
import { mkRedisDriver } from './server'
import { zygote, zygotePC } from './zygote'
import { wac, wacPC } from './wac'

// the main process have not service env value
const isMain = !process.env.SERVICE

if (isMain) {
  // master <--> redis
  const { inBound } = mkRedisDriver()

  // there is far away a redis <-> restapi
  // (...)

  // # Process call
  // sometimes
  zygotePC({ signupconnection })
  // sometimes
  wacPC({ connect })

} else if (process.env.SERVICE === 'zygote') {
  // signup <--> redis
  const signupconnection: Signupconnection = {
    type: 'signupconnection',
    userAccount: process.env.USER_ACCOUNT || '',
    webhook: process.env.WEBHOOK || '',
  }

  zygote(signupconnection)
    .then(({ jid, credspath }) => {
      // validade jid & save creds
      // (...)
    })
    .catch(console.error)
} else if (process.env.SERVICE === 'wac') {
  // connect <--> redis
  const connect: Connect = {
    type: 'connect',
    jid: process.env.JID || '',
    messageQuota: process.env.MESSAGE_QUOTA || '',
  }

  wac(connect)
    .then(({ jid, company }) => {
      // invoice & bot
      // (...)
    })
    .catch(console.error)
}
```

> childX.ts
```typescript
import { fork } from 'child_process'
import { writeFileSync, renameSync, unlinkSync } from 'fs'
import { client as redis, mkwebhookkey } from '@gmapi/redispack'
import { Signupconnection } from '@gmapi/types'

const zygote = function zygote (signupconnection: Signupconnection): Promise<Birth> {
  // your process setup
  // (...)
  return new Promise((res, rej) => {
    const { userAccount, webhook } = signupconnection

    // unique creds key
    const salt = String(Math.random()).slice(2)
    const preCredspath = `./auth_info_multi.${userAccount}-${salt}.json`

    // baileys new qrcode
    // (...)
    if (signupOk) {
      // creds keys of userX
      const credspath = `./auth_info_multi.${userAccount}.json`
      renameSync(preCredspath, credspath)

      const birth: Birth = {
        type: 'birth',
        jid: signupOk.jid,
        credspath
      }

      process.send(birth)
      res(birt)
    } else {
      process.send({ error: sugnupErr })
      rej(sugnupErr)
    }
  })
}

// Process Controller
const zygotePC = function zygotePC (signupconnection: Signupconnection): Promise<Birth> {
  // your fork setup
  // (...)
  return new Promise((res, rej) => {
    const { userAccount, webhook } = signupconnection
    const zgt = fork('./src/index', {
      env: {
        ...process.env,
        SERVICE: 'zygote',
        userAccount,
        webhook
      }
    })

    zgt.on('message', (birth: Birth) => {
      // pos signup cleanup
      // (...)
      zgt.kill('SIGINT')
      res(birth)
    })

    // you may want a health check
  })
}

export {
  zygote,
  zygotePC
}
```

- childX and childXPC have same type
- main call childXPC
- childXPC make env from args and fork
- children make args from env and call childX

you can turnoff multiprocess with childXPC calling childX in the same process

you may like [consul](https://www.consul.io/docs/intro)