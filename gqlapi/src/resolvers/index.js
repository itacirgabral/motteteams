const { URLResolver } = require('graphql-scalars')

module.exports = {
  URL: URLResolver,
  Query: {
    hello: () => 'Hello world!',
    signupconnection: require('./querySignupconnection'),
    lastqrcode: require('./queryLastqrcode'),
    webhook: require('./queryWebhook')
  },
  Subscription: {
    datenow: require('./subscriptionDatenow')
  }
}
