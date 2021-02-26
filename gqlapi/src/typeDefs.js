const { gql } = require('apollo-server')

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

  input SendtextmessageInput {
    to: String!
    msg: String!
    quoted: ID
  }

  type SendtextmessageOutput {
    wid: ID!
    timestamp: String!
    to: String!
    from: String!
    msg: String!
    quote: ID
    forwarded: Boolean
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
    webhook: URL
    connectionstate: String
  }

  type Mutation {
    webhook(input: URL): URL
    disconnect: String
    lastqrcode(input: LastQRCodeInput!): JWT
    signupconnection(input: SignupconnectionInput!): QRCode!
    queuerestart: String
    sendtextmessage(input: SendtextmessageInput!): SendtextmessageOutput
    reconect: String
  }

  type Subscription {
    datenow: String
    messages: String!
  }
`

module.exports = typeDefs
