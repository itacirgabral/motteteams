const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const gql = require('graphql-tag')
const { execute, makePromise } = require('apollo-link')

const authorization = process.env.AUTHORIZATION

const link = new HttpLink({
  uri: 'http://127.0.0.1:4000/graphql',
  fetch: fetch,
  headers: {
    authorization
  }
});

const operation = {
  query: gql`
    query {
      isAuth
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