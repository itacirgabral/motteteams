import got from 'got'

const lokiPushUrl = process.env.LOKI_PUSH_URL || 'http://loki:3100/loki/api/v1/push'
const hardid = process.env.HARDID || 'dev'

interface Tag {
  name: string;
  value: string;
}

const defaultTags: Array<Tag> = [
  {
    name: 'resource',
    value: hardid
  },
  {
    name: 'application',
    value: 'GMAPI'
  }
]

let lastMiliTime = Date.now()
let miliCicly = 0

const mkLoki = function mkLoki({ tags }: { tags: Array<Tag> }) {
  return function lokiLogger ({ log }: { log: string }): void {
    const stream = [...tags, ...defaultTags].reduce((acc: { [key: string]: string}, el) => {
      acc[el.name] = el.value
      return acc
    }, {})
    
    const timestamp = Date.now()
    if (timestamp > lastMiliTime) {
      lastMiliTime = timestamp
      miliCicly = 0
    } else {
      miliCicly = miliCicly + 1
    }

    const nanoTime = `${lastMiliTime}${String(miliCicly).padStart(6, '0')}`

    const json = {
      streams: [{
        stream,
        values: [
          [nanoTime, log]
        ]
      }]
    }

    got.post(lokiPushUrl, {
      json
    }).catch(console.error)
  }
}

export {
  mkLoki
}
