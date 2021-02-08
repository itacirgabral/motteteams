const { ApolloServer, PubSub } = require('apollo-server')

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const pubsub = new PubSub()
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
    // check connection for metadata
      return { ...connection.context, pubsub }
    } else {
    // check from req
      const token = req.headers.authorization || ''

      return { token, pubsub }
    }
  }
})

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
