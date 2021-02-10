import { gql, useQuery } from '@apollo/client'
import CircularProgress from '@material-ui/core/CircularProgress'
// $breed: String!
const SIGNUPCONNECTION = gql`
  query($webhook: String!, $remember: Boolean!, $selflog: Boolean! ) {
    signupconnection(input: {
      webhook: $webhook
      remember: $remember
      selflog: $selflog
    }) {
      qr
    }
  }
`

const NewInstanceWait = ({ webhook, remember, selflog, gotcode }) => {
  const { loading, error, data } = useQuery(SIGNUPCONNECTION, {
    variables: {
      webhook,
      remember,
      selflog
    },
  })

  if (loading) {
    console.log('loading')
    return <CircularProgress color="secondary" size="8rem"/>
  } else if (error) {
    <p>{`Error! ${error.message}`}</p>
  } else if (data) {
    const qr = data.signupconnection.qr
    gotcode(qr)
    return null
  }
}

export default NewInstanceWait
