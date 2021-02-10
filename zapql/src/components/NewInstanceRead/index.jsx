import { gql, useQuery } from '@apollo/client'
import QRCode from 'qrcode.react'

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

const NewInstanceRead = ({ qr, gotscan }) => {
  const { loading, error, data,  } = useQuery(LASTQRCODE, { variables: { qr } })

  if (loading) {
    return <QRCode id="QRCODE" level="L" value={qr} size={384}/>
  } else if (error) {
    <p>{`Error! ${error.message}`}</p>
  } else if (data) {
    const number = data.lastqrcode.userinfo.number
    const name = data.lastqrcode.userinfo.name
    const avatar = data.lastqrcode.userinfo.avatar
    const jwt = data.lastqrcode.jwt

    gotscan({ number, name, avatar, jwt })
    
    return null
  }
}

export default NewInstanceRead
