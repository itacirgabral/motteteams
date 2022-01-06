import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379'
const client = new Redis(redisUrl)

export {
  client
}
