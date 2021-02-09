import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Link } from "react-router-dom";
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';

import css from './css'

const NewInstance = ({ state, dispatch }) => {
  const stl = css()

  return <Box textAlign="center">
    <Typography component="h1" variant="h4"  className={stl.header}>
      Nova Instância
    </Typography>
    <Grid container>
      <Grid item xs={12}>

      </Grid>
    </Grid>
    <Grid container >
      <Grid item xs={6}>
        <Button className={stl.clear} fullWidth component={Link} to="/">
          <ClearIcon fontSize='large' />
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button className={stl.clear} fullWidth >
          <CheckIcon fontSize='large' />
        </Button>
      </Grid>
    </Grid>
  </Box>
}

export default NewInstance
