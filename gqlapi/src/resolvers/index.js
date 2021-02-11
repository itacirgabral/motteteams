module.exports = {
  Query: {
    hello: () => 'Hello world!',
    signupconnection: require('./querySignupconnection'),
    lastqrcode: require('./queryLastqrcode')
  },
  Subscription: {
    datenow: require('./subscriptionDatenow')
  }
}
