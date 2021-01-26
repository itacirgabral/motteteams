const newskey = 'zap:panoptics:slotnews'
const hardid = process.env.HARDID

const getshard = ({ redis, redisW }) => new Promise((resolve, reject) => {
  const wannaconn = JSON.stringify({
    type: 'wannaconn',
    hardid
  })

  let intervalId = 0

  redisW.subscribe(newskey, (err, _count) => {
    if (!err) {
      redisW.on('message', async (_channel, message) => {
        const { type, ...leftover } = JSON.parse(message)
        if (type === 'grabcreds' && hardid === leftover.hardid) {
          redisW.unsubscribe(newskey)
          clearInterval(intervalId)
          resolve(leftover.shard)
        }
      })
    }
  })

  redis.publish(newskey, wannaconn)
  intervalId = setInterval(() => {
    redis.publish(newskey, wannaconn)
  }, 1000)
})

module.exports = getshard
