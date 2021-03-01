const { ApolloServer, PubSub, gql, AuthenticationError } = require('apollo-server')
const Redis = require('ioredis')
const { URLResolver } = require('graphql-scalars')
const jsonwebtoken = require('jsonwebtoken')

const redis = new Redis(process.env.REDIS_CONN)
const jwtSecret = process.env.JWT_SECRET
const pubsub = new PubSub()

const messages = require('./messages')
const connection = require('./connection')
const signup = require('./signup')
const chats = require('./chats')

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
    isAuthClock: tic ? 'TIC' : 'TOC'
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

const apollo = new ApolloServer({
  typeDefs: [
    typeDefs,
    connection.typeDefs,
    messages.typeDefs,
    signup.typeDefs,
    chats.typeDefs
  ],
  resolvers: {
    URL: URLResolver,
    ...messages.resolvers.Root,
    Query: {
      hello: () => 'world!',
      isAuth: (parent, args, context, info) => !!context.user,
      ...connection.resolvers.Query,
      // ...messages.resolvers.Query,
      // ...signup.resolvers.Query,
      ...chats.resolvers.Query
    },
    Mutation: {
      toggleTic: () => {
        tic = !tic
        return tic
      },
      ...connection.resolvers.Mutation,
      ...messages.resolvers.Mutation,
      ...signup.resolvers.Mutation
      // ...chats.resolvers.Mutation
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
      // ...connection.resolvers.Subscription,
      ...messages.resolvers.Subscription
      // ...signup.resolvers.Subscription,
      // ...chats.resolvers.Mutation
    }
  },
  introspection: true,
  context: async ({ req, connection }) => {
    let user
    let sid
    if (connection) {
      user = connection.context.user
      sid = connection.context.sid
    } else {
      const authorization = req.headers.authorization || Bearer
      try {
        const jwt = authorization.split(Bearer)[1]
        user = jsonwebtoken.verify(jwt, jwtSecret)
      } catch {
        user = null
      }
    }

    const context = {
      ...defaultContext
    }
    context.user = user
    if (sid) {
      context.sid = sid
    }

    return context
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

      if (user) {
        console.log(`onConnect ${user.shard}`)
      }

      return {
        user,
        sid
      }
    },
    onDisconnect: async (webSocket, context) => {
      const initialContext = await context.initPromise
      console.log(`onDisconnect ${initialContext.user.shard}`)

      const radiohookkey = `zap:${initialContext.user.shard}:radiohook`
      const type = 'subscriptionTurnoff'
      const sid = initialContext.sid

      redis.publish(radiohookkey, JSON.stringify({ type, sid }))
    }
  }
})

apollo.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
