const { gql, AuthenticationError } = require('apollo-server')

const CLOCK = 'CLOCK'
let tic = true
let setTimeoutId = 0

module.exports = ({ pubsub }) => {
  if (setTimeoutId === 0) {
    pubsub.publish(CLOCK, { isAuthClock: tic ? 'TIC' : 'TAC' })

    setTimeoutId = setInterval(() => {
      tic = !tic
      pubsub.publish(CLOCK, { isAuthClock: tic ? 'TIC' : 'TAC' })
    }, 1000)
  }

  return {
    typeDefs: gql`
      extend type Query {
        hello: String!
        isAuth: Boolean!
      }
      extend type Subscription {
        isAuthClock: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'world!',
        isAuth: (parent, args, context, info) => !!context.user
      },
      Mutation: {},
      Subscription: {
        isAuthClock: {
          subscribe: (parent, args, context, info) => {
            if (context.user) {
              console.dir({ context })
              return context.pubsub.asyncIterator(['CLOCK'])
            } else {
              throw new AuthenticationError('do auth')
            }
          }
        }
      }
    }
  }
}
