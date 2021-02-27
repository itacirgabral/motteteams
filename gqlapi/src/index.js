const { ApolloServer, PubSub, gql, AuthenticationError } = require('apollo-server')
const Redis = require('ioredis')
const { URLResolver } = require('graphql-scalars')
const jsonwebtoken = require('jsonwebtoken')

const redis = new Redis(process.env.REDIS_CONN)
const jwtSecret = process.env.JWT_SECRET
const pubsub = new PubSub()

const messages = require('./messages')
const connection = require('./connection')

const defaultContext = {
  pubsub,
  redis,
  hardid: process.env.HARDID,
  panoptickey: 'zap:panoptic'
}
const Bearer = 'Bearer '

const CLOCK = 'CLOCK'
let tic = true
setInterval(() => {
  tic = !tic
  pubsub.publish(CLOCK, {
    isAuthClock: tic ? 'TIC' : 'TCC'
  })
}, 1000)

const typeDefs = gql`
  scalar URL
  type Query {
    hello: String!
    isAuth: Boolean!
  }
  type Mutation {
    toggleTic: Boolean
  }
  type Subscription {
    isAuthClock: String!
  }
`

const server = new ApolloServer({
  typeDefs: [
    typeDefs,
    connection.typeDefs
    // messages.typeDefs
  ],
  resolvers: {
    URL: URLResolver,
    Query: {
      hello: () => 'world! 2',
      isAuth: (parent, args, context, info) => !!context.user,
      ...connection.resolvers.Query
      // ...messages.resolvers.Query,
    },
    Mutation: {
      toggleTic: () => {
        tic = !tic
        return tic
      },
      ...connection.resolvers.Mutation
      // ...messages.resolvers.Mutation,
    },
    Subscription: {
      isAuthClock: {
        subscribe: (parent, args, context, info) => {
          if (context.user) {
            return context.pubsub.asyncIterator(['CLOCK'])
          } else {
            throw new AuthenticationError('do auth')
          }
        }
      },
      ...connection.resolvers.Subscription
      // ...messages.resolvers.Subscription,
    }
  },
  cors: {
    origin: '*',
    credentials: true
  },
  introspection: true,
  context: async ({ req, connection }) => {
    let user
    if (connection) {
      user = connection.context.user
    } else {
      const authorization = req.headers.authorization || Bearer
      try {
        const jwt = authorization.split(Bearer)[1]
        user = jsonwebtoken.verify(jwt, jwtSecret)
      } catch {
        user = null
      }
    }

    return {
      ...defaultContext,
      user
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
      console.dir({ initialContext })
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
