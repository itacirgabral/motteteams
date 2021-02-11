const { URLResolver } = require('graphql-scalars')

module.exports = {
  URL: URLResolver,
  Query: {
    hello: () => 'Hello world!',
    signupconnection: require('./querySignupconnection'),
    lastqrcode: require('./queryLastqrcode'),
    webhook: require('./queryWebhook')
  },
  Mutation: {
    webhook: require('./mutationWebhook')
  },
  Subscription: {
    datenow: require('./subscriptionDatenow')
  }
}
