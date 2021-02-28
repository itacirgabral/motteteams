const { gql } = require('apollo-server')
const lastqrcode = require('./lastqrcode')
const signupconnection = require('./signupconnection')

const typeDefs = gql`
  input LastQRCodeInput {
    qr: String!
  }

  input SignupconnectionInput {
    webhook: String
    remember: Boolean
    selflog: Boolean
  }

  type QRCode {
    qr: String
  }

  type UserInfo {
    number: String!
    name: String
    avatar: String
  }

  type JWT {
    jwt: String!
    userinfo: UserInfo!
  }

  extend type Mutation {
    lastqrcode(input: LastQRCodeInput!): JWT
    signupconnection(input: SignupconnectionInput!): QRCode!
  }
`

const resolvers = {
  Root: {},
  Query: {},
  Mutation: {
    lastqrcode,
    signupconnection
  },
  Subscription: {}
}

module.exports = {
  typeDefs,
  resolvers
}
