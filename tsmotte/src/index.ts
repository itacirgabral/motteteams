import { fork, ChildProcess } from 'child_process'

const isMain = !process.env.SERVICE

console.log(`isMain=${isMain}`)
console.log(`SERVICE=${process.env.SERVICE}`)

if (isMain) {
  // 500
  const zgt = fork('./src/index', {
    env: {
      ...process.env,
      SERVICE: 'zygote'
    }
  })

  // 1000
  setInterval(() => {
    zgt ? zgt.send('opa') : undefined
  }, 1000)

} else if (process.env.SERVICE === 'zygote') {
  console.log(`zygote de pé ${process.pid}`)
  process.on('message', (message) => {
    console.log(`recebi ${message}`)
  })
}

// online
// disconnect
// listening
// message
// error
// exit