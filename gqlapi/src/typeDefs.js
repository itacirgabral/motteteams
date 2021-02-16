const { gql } = require('apollo-server-express')

const typeDefs = gql`
  scalar URL

  input LastQRCodeInput {
    qr: String!
  }
  input SignupconnectionInput {
    webhook: String
    remember: Boolean
    selflog: Boolean
  }

  type QRCode {
    """
    type is qr
    """
    type: String!
    qr: String
  }

  type UserInfo {
    number: String!
    name: String
    avatar: String
  }

  type JWT {
    """
    type is jwt
    """
    type: String!
    jwt: String!
    userinfo: UserInfo!
  }

  type Query {
    hello: String!
    lastqrcode(input: LastQRCodeInput!): JWT
    signupconnection(input: SignupconnectionInput!): QRCode!
    webhook: URL
    connectionstate: String
  }

  type Mutation {
    webhook(input: URL): URL
    disconnect: String
    queuerestart: String
  }

  type Subscription {
    datenow: String
  }
`

module.exports = typeDefs
