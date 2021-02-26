const { gql, AuthenticationError } = require('apollo-server')

module.exports = ({ pubsub }) => {
  // asdf
  return {
    typeDefs: gql`
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
      extend type Mutation {
        sendtextmessage(input: SendtextmessageInput!): SendtextmessageOutput
      }
    `,
    resolvers: {
      Query: {},
      Mutation: {},
      Subscription: {}
    }
  }
}
