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
  const { data } = await makePromise(execute(link, operation))
    .catch(error => {
      t.fail()
    })
  
    t.deepEqual(data, { hello: 'world!' })
})