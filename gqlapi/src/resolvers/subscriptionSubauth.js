const { AuthenticationError } = require('apollo-server')

const subscriptionSubauth = {
  subscribe: (parent, args, context, info) => {
    if (context?.user?.shard) {
      return context.pubsub.asyncIterator(['tag'])
    } else {
      throw new AuthenticationError('do auth')
    }
  }
}

module.exports = subscriptionSubauth
