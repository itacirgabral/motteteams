const { URLResolver } = require('graphql-scalars')

module.exports = {
  URL: URLResolver,
  Query: {
    hello: () => 'Hello world!',
    signupconnection: require('./querySignupconnection'),
    lastqrcode: require('./queryLastqrcode'),
    webhook: require('./queryWebhook'),
    connectionstate: require('./queryConnectionstate')
  },
  Mutation: {
    webhook: require('./mutationWebhook'),
    disconnect: require('./mutationDisconnect')
  },
  Subscription: {
    datenow: require('./subscriptionDatenow')
  }
}
