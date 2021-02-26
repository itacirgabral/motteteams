const { ApolloServer, PubSub, gql } = require('apollo-server')
const { URLResolver } = require('graphql-scalars')
const jsonwebtoken = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const pubsub = new PubSub()

const helloAuth = require('./helloAuth')({ pubsub })
const messages = require('./messages')({ pubsub })
const connection = require('./connection')({ pubsub })

const defaultContext = {
  pubsub,
  hardid: process.env.HARDID,
  panoptickey: 'zap:panoptic'
}
const Bearer = 'Bearer '

const typeDefs = gql`
  scalar URL
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`

const server = new ApolloServer({
  typeDefs: [
    typeDefs,
    helloAuth.typeDefs,
    messages.typeDefs,
    connection.typeDefs
  ],
  resolvers: {
    URL: URLResolver,
    Query: {
      // _: () => {},
      // ...helloAuth.resolvers.Query,
      // ...messages.resolvers.Query,
      // ...connection.resolvers.Query,
    },
    Mutation: {
      // _: () => {},
      // ...helloAuth.resolvers.Mutation,
      // ...messages.resolvers.Mutation,
      // ...connection.resolvers.Mutation,
    },
    Subscription: {
      // _: async function * _ () {},
      // ...helloAuth.resolvers.Subscription,
      // ...messages.resolvers.Subscription,
      // ...connection.resolvers.Subscription,
    }
  },
  mocks: true,
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
