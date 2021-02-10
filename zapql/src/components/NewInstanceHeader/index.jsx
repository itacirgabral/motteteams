import Typography from '@material-ui/core/Typography'

import css from './css'

const NewInstanceHeader = () => {
  const stl = css()
  return  <Typography component="h1" variant="h4"  className={stl.header}>
    Nova Instância
  </Typography>
}

export default NewInstanceHeader
