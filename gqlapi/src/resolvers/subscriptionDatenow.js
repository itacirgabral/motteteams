const DATE_NOW = 'DATE_NOW'
let subs = 0

const subscriptionDatenow = {
  subscribe: (parent, args, context, info) => {
    if (subs === 0) {
      subs = setInterval(() => {
        context.pubsub.publish(DATE_NOW, { datenow: String(Date.now()) })
      }, 1000)
    }

    return context.pubsub.asyncIterator([DATE_NOW])
  }
}

module.exports = subscriptionDatenow
