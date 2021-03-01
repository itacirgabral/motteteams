const { gql } = require('apollo-server')

const connectionstate = require('./connectionstate')
const reconnect = require('./reconnect')
const disconnect = require('./disconnect')
const drumerrestart = require('./drumerrestart')

module.exports = {
  typeDefs: gql`
    extend type Query {
      connectionstate: String
    }
    extend type Mutation {
      reconnect: String
      disconnect: String
      drumerrestart: String
    }
  `,
  resolvers: {
    Query: {
      connectionstate
    },
    Mutation: {
      reconnect,
      disconnect,
      drumerrestart
    },
    Subscription: {}
  }
}
