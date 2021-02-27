const { ApolloServer, PubSub } = require('apollo-server')
const Redis = require('ioredis')
const jsonwebtoken = require('jsonwebtoken')

const redis = new Redis(process.env.REDIS_CONN)
const jwtSecret = process.env.JWT_SECRET
const defaultContext = {
  pubsub: new PubSub(),
  redis,
  hardid: process.env.HARDID,
  panoptickey: 'zap:panoptic'
}
const Bearer = 'Bearer '

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    let user
    if (connection) {
      user = connection.context.user
    } else {
      const authorization = req.headers.authorization || Bearer
      try {
        user = jsonwebtoken.verify(authorization.split(Bearer)[1], jwtSecret)
      } catch {
        user = null
      }
    }
    return {
      ...defaultContext,
      user,
      sid: connection.context.sid
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      const authorization = connectionParams.authorization || Bearer
      const sid = String(Math.random()).slice(2)
      let user
      try {
        user = jsonwebtoken.verify(authorization.split(Bearer)[1], jwtSecret)
      } catch {
        user = null
      }

      return {
        user,
        sid
      }
    },
    onDisconnect: async (webSocket, context) => {
      console.log('onDisconnect')
      const initialContext = await context.initPromise

      const radiohookkey = `zap:${initialContext.user.shard}:radiohook`
      const type = 'subscriptionTurnoff'
      const sid = initialContext.sid

      redis.publish(radiohookkey, JSON.stringify({ type, sid }))
    },
    onOperation: () => {
      console.log('onOperation')
    },
    onOperationComplete: () => {
      console.log('onOperationComplete')
    }
  },
  cors: {
    origin: '*',
    credentials: true
  },
  introspection: true
})

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
