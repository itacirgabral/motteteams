import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import css from './css'

const Footer = () => {
  const stl = css()

  return <Box textAlign="center" className={stl.box}>
    <Typography variant="body1">Preda Petu</Typography>
  </Box>
}

export default Footer
