const { gql, AuthenticationError } = require('apollo-server')

const typeDefs = gql`
  extend type Query {
    allchats: [String]!
  }
`

const resolvers = {
  Query: {
    allchats: async (parent, args, context, info) => {
      if (context?.user?.shard) {
        const redis = context.redis.duplicate()
        const chatsKeys = `zap:${context.user.shard}:chats`

        const allchats = await redis.smembers(chatsKeys)

        return allchats
      } else {
        throw new AuthenticationError('do auth')
      }
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
