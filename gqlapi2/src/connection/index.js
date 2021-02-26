const { gql, AuthenticationError } = require('apollo-server')

const timeout = Number(process.env.TIMEOUT || '5000')

module.exports = ({ pubsub }) => {
  // asdf
  return {
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
      Query: {},
      Mutation: {
        reconect: async (parent, args, context, info) => {
          console.log('0')
          if (context.user) {
            console.log('1')
            console.dir({ context })
            const redisB = context.redis.duplicate()
            const radiohookkey = `zap:${context.user.shard}:radiohook`

            await redisB.subscribe(radiohookkey)

            let timeoutId
            const queryResult = new Promise((resolve, reject) => {
              timeoutId = setTimeout(() => {
                redisB.unsubscribe(radiohookkey)
                resolve(null)
                console.log('out')
              }, timeout)

              redisB.on('message', (channel, message) => {
                console.log('m')
                const { type } = JSON.parse(message)
                if (type === 'opened') {
                  redisB.unsubscribe()
                  clearTimeout(timeoutId)
                  resolve(null)
                }
              })
            })

            console.log('2')
            await context.redis.publish(context.panoptickey, JSON.stringify({
              type: 'connect',
              hardid: context.hardid,
              shard: context.user.shard
            }))

            console.log('3')
            return queryResult
          } else {
            throw new AuthenticationError('do auth')
          }
        }
      },
      Subscription: {}
    }
  }
}
