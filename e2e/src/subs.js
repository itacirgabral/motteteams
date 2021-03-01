const  { WebSocketLink } = require('apollo-link-ws')
const gql = require('graphql-tag')
const { execute, makePromise } = require('apollo-link')
const ws = require('ws')

const authorization = process.env.AUTHORIZATION
// https://github.com/apollographql/apollo-client/issues/3967


const link = new WebSocketLink({
  uri: `ws://127.0.0.1:4000/graphql`,
  options: {
    connectionParams: {
      authorization,
    }
  },
  webSocketImpl: ws,
})

const operation = {
  query: gql`
    subscription {
      isAuthClock
    }
  `
};

/*
// execute returns an Observable so it can be subscribed to

// For single execution operations, a Promise can be used
makePromise(execute(link, operation))
  .then(data => console.log(`received data ${JSON.stringify(data, null, 2)}`))
  .catch(error => console.log(`received error ${error}`))
*/

execute(link, operation).subscribe({
  next: data => console.log(`received data: ${JSON.stringify(data, null, 2)}`),
  error: error => console.log(`received error ${error}`),
  complete: () => console.log(`complete`),
})