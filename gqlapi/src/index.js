const { ApolloServer, PubSub } = require('apollo-server')
const Redis = require('ioredis')
const jsonwebtoken = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const defaultContext = {
  pubsub: new PubSub(),
  redis: new Redis(process.env.REDIS_CONN),
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
    const authorization = connection
      ? connection.context.authorization
      : req.headers.authorization || Bearer

    let user
    try {
      user = await jsonwebtoken.verify(authorization.split(Bearer)[1], jwtSecret)
    } catch {
      user = null
    }

    return {
      ...defaultContext,
      user
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      return {
        authorization: connectionParams.authorization || Bearer
      }
    },
    onDisconnect: async (webSocket, context) => {
      console.log('onDisconnect')
      const initialContext = await context.initPromise
      console.dir({ initialContext })
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
  }
})

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
