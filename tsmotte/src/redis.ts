import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379'
const redis = new Redis(redisUrl)

export {
  redis
}