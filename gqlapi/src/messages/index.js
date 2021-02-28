const { gql } = require('apollo-server-express')
const messages = require('./messages')
const sendtextmessage = require('./sendtextmessage')

const typeDefs = gql`
  input SendtextmessageInput {
    to: String!
    msg: String!
    quote: ID
  }

  type TextMesage {
    wid: ID!
    timestamp: String!
    to: String!
    from: String!
    msg: String!
    author: String
    quote: ID
    forwarded: Boolean
  }

  type LocationMesage {
    wid: ID!
    timestamp: String!
    to: String!
    from: String!
    description: String!
    latitude: Float!
    longitude: Float!
    quote: ID
    forwarded: Boolean
  }

  union Message = TextMesage | LocationMesage

  extend type Mutation {
    sendtextmessage(input: SendtextmessageInput!): TextMesage
  }
  extend type Subscription {
    messages: Message!
  }
`

const resolvers = {
  Root: {
    Message: {
      __resolveType: (obj, context, info) => {
        if (obj.msg) {
          return 'TextMesage'
        }
        if (obj.latitude) {
          return 'LocationMesage'
        }
        return null
      }
    }
  },
  Query: {},
  Mutation: {
    sendtextmessage
  },
  Subscription: {
    messages
  }
}

module.exports = {
  typeDefs,
  resolvers
}
