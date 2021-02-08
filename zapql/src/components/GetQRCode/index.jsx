

import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import QRCode from 'qrcode.react'
import css from './css'

const SIGNUPCONNECTION = gql`
  query {
    signupconnection(input: {
      webhook: "https://1234.ngrok.com"
      remember: true
      selflog: true
    }) {
      qr
    }
  }
`

const LASTQRCODE = gql`
query {
  lastqrcode(input: {
    qr: "1@JmcciH4ex8Mi3X3VLm+le+zeWJtTbL2I6HvLReHieByl+VvM2GQvLQm4Wb0OVeMntm7vJGA/7YCGKw==,Z+Bkg8RbkDZ0TA2qugaZervpOJ0k+EgbV27X0ddtYS4=,dySLIPDeon0mvDP+euM32g=="
  }) {
      jwt
      userinfo {
        number
        name
        avatar
      }
    }
  }
`

const GetQRCode = ({ state, dispatch }) => {
  const { loading, error, data, refetch } = useQuery(SIGNUPCONNECTION)
  const [lastQRCodeTrigger, lastQRCodedata ] = useLazyQuery(LASTQRCODE)
  const stl = css()
  // level 'L' 'M' 'Q' 'H'

  const mkBox = el => <Box>
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      className={stl.minHeight18}
    >
      <Grid item>
        { el }
      </Grid>
    </Grid>
  </Box>
  
  if (loading) {
    return mkBox(<CircularProgress color="secondary" size="8rem"/>)
  } else if (error || lastQRCodedata.error) {
    return  mkBox(<p>{`Error! ${error.message || lastQRCodedata.error}`}</p>)
  } else if (data && !lastQRCodedata.called) {

    console.log(`qr=${data.signupconnection.qr}`)
    lastQRCodeTrigger()
    return mkBox(<QRCode id="QRCODE" level="L" value={data.signupconnection.qr} size={384}/>)

  } else if (data && lastQRCodedata.loading) {
    return mkBox(<QRCode id="QRCODE" level="L" value={data.signupconnection.qr} size={384}/>)
  } else if (data && lastQRCodedata.data) {
    console.log('lastQRCodedata.dat')
    console.dir(lastQRCodedata.data)
    dispatch({ type: 'setNewinstance', number: lastQRCodedata.data.lastqrcode.userinfo.number })
    return <Redirect to="/"/>
  } else {
    return null
  }
}

export default GetQRCode

