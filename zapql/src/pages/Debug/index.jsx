import { gql, useQuery } from '@apollo/client'

const qr = "xxx.yyy.zzz"

const LASTQRCODE = gql`
query($qr: String!) {
  lastqrcode(input: { qr: $qr }) {
    type
    jwt
    userinfo {
      number
      name
      avatar
    }
  }
}
`
const Debug = () => {
  const { loading, error, data,  } = useQuery(LASTQRCODE, { variables: { qr }})

  if (loading) {
    return <p>loading</p>
  } else if (error) {
    console.error(error)
    return <p>error</p>
  } else if (data) {
    console.dir(data)
    return <p>data</p>
  } else {
    return <p>hããã</p>
  }
}

export default Debug