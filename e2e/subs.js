const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const  { WebSocketLink } = require('apollo-link-ws')
const gql = require('graphql-tag')
const { execute, makePromise } = require('apollo-link')

const httpLink = new HttpLink({
  uri: 'http://127.0.0.1:4000/graphql',
  fetch: fetch
})
const wsLink = new WebSocketLink({
  uri: `ws://127.0.0.1:4000/graphql`,
  options: {
    reconnect: true
  }
})

const operation = {
  query: gql`
    query {
      hello
    }
  `
};

/*
// execute returns an Observable so it can be subscribed to
execute(link, operation).subscribe({
  next: data => console.log(`received data: ${JSON.stringify(data, null, 2)}`),
  error: error => console.log(`received error ${error}`),
  complete: () => console.log(`complete`),
})

*/


// For single execution operations, a Promise can be used
makePromise(execute(link, operation))
  .then(data => console.log(`received data ${JSON.stringify(data, null, 2)}`))
  .catch(error => console.log(`received error ${error}`))