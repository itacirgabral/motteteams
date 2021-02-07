const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { ApolloServer, gql } = require('apollo-server-express')

const querySignupconnection = require('./resolvers/querySignupconnection')

const typeDefs = gql`
  input LastQRCodeInput {
    qr: String!
  }

  """
  If the attempt fail
  """
  type QRCode {
    """
    type is qr
    """
    type: String!
    qr: String!
    attempts: Int
  }

  type UserInfo {
    number: String!
    name: String
    avatar: String
  }
  """
  If the attempt success
  """
  type JWT {
    """
    type is jwt
    """
    type: String!
    jwt: String!
    userinfo: UserInfo!
  }

  union SignupconnectionResponse = QRCode | JWT

  type Query {
    hello: String!
    signupconnection(input: LastQRCodeInput): SignupconnectionResponse
  }
`

const resolvers = {
  SignupconnectionResponse: {
    __resolveType: (obj, context, info) => {
      switch (obj.type) {
        case 'qr':
          return 'QRCode'
        case 'jwt':
          return 'JWT'
      }
    }
  },
  Query: {
    hello: () => 'Hello world!',
    signupconnection: querySignupconnection
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

const app = express()
// app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('frontend/build'))

server.applyMiddleware({ app })

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
