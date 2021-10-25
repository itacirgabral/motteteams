import { fork } from 'child_process'

const isMain = !process.env.SERVICE

console.log(`isMain=${isMain}`)
console.log(`SERVICE=${process.env.SERVICE}`)

if (isMain) {
  // 500
  setTimeout(() => {
    fork('./src/index', {
      env: {
        ...process.env,
        SERVICE: 'zygote'
      }
    })
  }, 500)

  // 1000
  setInterval(() => {
    console.log('iniciei zygote')
  }, 1000)
} else if (process.env.SERVICE === 'zygote') {
  setInterval(() => {
    console.log('zygote de pé')
  }, 1000)
}