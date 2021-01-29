/**
 * when WA updates the credentials
 * on (event: 'credentials-updated', listener: (auth: AuthenticationCredentials) => void): this
 */
const credentialsUpdated = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const credsKey = `zap:${seed.shard}:creds`

  return async (auth) => {
    const creds = seed.conn.base64EncodedAuthInfo()

    const json = JSON.stringify({ event: 'credentials-updated', data: creds })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)

    pipeline.set(credsKey, JSON.stringify(creds))
    pipeline.bgsave()

    await pipeline.exec()
  }
}

module.exports = credentialsUpdated