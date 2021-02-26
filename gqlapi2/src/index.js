const { ApolloServer, PubSub, gql, AuthenticationError } = require('apollo-server')
const jsonwebtoken = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const pubsub = new PubSub()

const defaultContext = {
  pubsub,
  hardid: process.env.HARDID,
  panoptickey: 'zap:panoptic'
}
const Bearer = 'Bearer '

const CLOCK = 'CLOCK'
let tic = false
setInterval(() => {
  tic = !tic
  pubsub.publish(CLOCK, { isAuthClock: tic ? 'TIC' : 'TAC' })
}, 1000)

const typeDefs = gql`
  type Query {
    hello: String!
    isAuth: Boolean!
  }
  type Subscription {
    isAuthClock: String!
  }
`
const resolvers = {
  Query: {
    hello: () => 'world!',
    isAuth: (parent, args, context, info) => !!context.user
  },
  Subscription: {
    isAuthClock: {
      subscribe: (parent, args, context, info) => {
        if (context.user) {
          console.dir({ context })
          return context.pubsub.asyncIterator([CLOCK])
        } else {
          throw new AuthenticationError('do auth')
        }
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
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
        user = jsonwebtoken.verify(authorization.split(Bearer)[1], jwtSecret)
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
