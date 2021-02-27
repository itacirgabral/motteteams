const { gql, AuthenticationError } = require('apollo-server')

const timeout = Number(process.env.TIMEOUT || '5000')

module.exports = {
  typeDefs: gql`
    extend type Query {
      connectionstate: String
    }
    extend type Mutation {
      reconect: String
      disconnect: String
      drumerrestart: String
    }
  `,
  resolvers: {
    Query: {
      connectionstate: async (parent, args, context, info) => {
        if (context.user) {
          const redisB = context.redis.duplicate()
          const radiohookkey = `zap:${context.user.shard}:radiohook`

          await redisB.subscribe(radiohookkey)
          const queryResult = new Promise((resolve, reject) => {
            setTimeout(() => {
              redisB.unsubscribe(radiohookkey)
              resolve(null)
            }, timeout)

            redisB.on('message', (channel, message) => {
              const { type, state } = JSON.parse(message)
              if (type === 'connectionstate') {
                redisB.unsubscribe()
                resolve(state)
              }
            })
          })

          await context.redis.publish(context.panoptickey, JSON.stringify({
            type: 'connectionstate',
            hardid: context.hardid,
            shard: context.user.shard
          }))

          return queryResult
        } else {
          throw new AuthenticationError('do auth')
        }
      }
    },
    Mutation: {
      reconect: async (parent, args, context, info) => {
        if (context.user) {
          const redisB = context.redis.duplicate()
          const radiohookkey = `zap:${context.user.shard}:radiohook`

          await redisB.subscribe(radiohookkey)

          let timeoutId
          const queryResult = new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
              redisB.unsubscribe(radiohookkey)
              resolve(null)
            }, timeout)

            redisB.on('message', (channel, message) => {
              const { type } = JSON.parse(message)
              if (type === 'opened') {
                redisB.unsubscribe()
                clearTimeout(timeoutId)
                resolve('conected')
              }
            })
          })

          await context.redis.publish(context.panoptickey, JSON.stringify({
            type: 'connect',
            hardid: context.hardid,
            shard: context.user.shard
          }))

          return queryResult
        } else {
          throw new AuthenticationError('do auth')
        }
      },
      disconnect: async (parent, args, context, info) => {
        if (context.user) {
          const redisB = context.redis.duplicate()
          const radiohookkey = `zap:${context.user.shard}:radiohook`

          await redisB.subscribe(radiohookkey)

          let timeoutId
          const queryResult = new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
              redisB.unsubscribe(radiohookkey)
              resolve(null)
            }, timeout)

            redisB.on('message', (channel, message) => {
              const { type } = JSON.parse(message)
              if (type === 'closed') {
                redisB.unsubscribe()
                clearTimeout(timeoutId)
                resolve('disconected')
              }
            })
          })

          await context.redis.publish(context.panoptickey, JSON.stringify({
            type: 'disconnect',
            hardid: context.hardid,
            shard: context.user.shard
          }))

          return queryResult
        } else {
          throw new AuthenticationError('do auth')
        }
      }
    },
    Subscription: {}
  }
}
