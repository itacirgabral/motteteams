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
    disconnect: require('./mutationDisconnect'),
    queuerestart: require('./mutationQueuerestart')
  },
  Subscription: {
    datenow: require('./subscriptionDatenow')
  }
}
