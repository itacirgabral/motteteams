const { gql, AuthenticationError } = require('apollo-server')

module.exports = ({ pubsub }) => {
  // asdf
  return {
    typeDefs: gql`
      extend type Mutation {
        reconect: String
        disconnect: String
        queuerestart: String
      }
    `,
    resolvers: {
      Query: {},
      Mutation: {},
      Subscription: {}
    }
  }
}
