// import { useLocalStorage, writeStorage } from '@rehooks/local-storage'
// const [instancies] = useLocalStorage('instancies', {})
// writeStorage('instancies', {...instancies, [number]: { name, jwt, avatar }})

import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'

const NewInstanceAgreement = ({ store }) => {
  // store()

  return <Box fontFamily="Monospace" letterSpacing={10}>
    <Typography variant="body1">Este é um serviço gratuito e limitado, sem nenhuma garantia.</Typography>
    <Typography variant="body2">Ao utilizar você está concordando com nossa política de uso e privacidade.</Typography>
  </Box>
}

export default NewInstanceAgreement
