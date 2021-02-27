const { gql, AuthenticationError } = require('apollo-server')

const connectionstate = require('./connectionstate')
const reconect = require('./reconect')
const disconnect = require('./disconnect')
const drumerrestart = require('./drumerrestart')

module.exports = {
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
    Query: {
      connectionstate
    },
    Mutation: {
      reconect,
      disconnect,
      drumerrestart
    },
    Subscription: {}
  }
}
