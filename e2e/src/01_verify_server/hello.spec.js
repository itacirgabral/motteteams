const test = require('tape')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const gql = require('graphql-tag')
const { execute, makePromise } = require('apollo-link')

const uri = process.env.URI
const link = new HttpLink({ uri, fetch: fetch })

const operation = {
  query: gql`
    query {
      hello
    }
  `
}

test('# QUERY HELLO', async t => {
  t.plan(1)

  makePromise(execute(link, operation))
    .then(data => {
      t.deepEqual(data, {
        data: {
          hello: 'world!'
        }
      })
    })
    .catch(error => {
      t.fail()
    })
})