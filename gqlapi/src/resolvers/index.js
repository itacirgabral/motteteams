const { URLResolver } = require('graphql-scalars')

module.exports = {
  URL: URLResolver,
  Query: {
    hello: () => 'Hello world!',
    webhook: require('./queryWebhook'),
    connectionstate: require('./queryConnectionstate')
  },
  Mutation: {
    webhook: require('./mutationWebhook'),
    disconnect: require('./mutationDisconnect'),
    signupconnection: require('./mutationSignupconnection'),
    lastqrcode: require('./mutationLastqrcode'),
    queuerestart: require('./mutationQueuerestart'),
    sendtextmessage: require('./mutationSendtextmessage'),
    reconect: require('./mutationReconect')
  },
  Subscription: {
    datenow: require('./subscriptionDatenow'),
    messages: require('./subscriptionMessages')
  }
}
