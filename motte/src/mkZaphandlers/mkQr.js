/**
 * when a new QR is generated, ready for scanning
 * on (event: 'qr', listener: (qr: string) => void): this
 */
const qr = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (qr) => {
    const json = JSON.stringify({ event: 'qr', data: qr })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)

    const lastQrcodekey = `zap:${shard}:lasQrcode`
    pipeline.set(lastQrcodekey, qr)
    await pipeline.exec()
  }
}

module.exports = qr
