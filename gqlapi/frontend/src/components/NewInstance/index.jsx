import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Link from "react-router-dom/Link";
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';


import css from './css'

const NewInstance = () => {
  const stl = css()
  return <Box textAlign="center">
    <Typography component="h1" variant="h4"  className={stl.header}>
      Nova Instância
    </Typography>
    <Grid container>
      <Grid item xs={12}>
        <FormControl className={stl.form}>
          <FormControlLabel id="checkboxautomensagem"
            control={<Checkbox checked={true} name="automensagem" />}
            label="Enviar Auto Mensagem"
          />
          <FormControlLabel id="checkboxlembrar"
            control={<Checkbox checked={false} name="lembrar" />}
            label="Lembrar da instância"
          />
          <TextField id="inputwebhook" label="webhook url" />
        </FormControl>
      </Grid>
    </Grid>
    <Grid container >
    <Grid item xs={6}>
      <Button className={stl.clear} fullWidth component={Link} to="/">
        <ClearIcon fontSize='large' />
      </Button>
    </Grid>
    <Grid item xs={6}>
      <Button className={stl.clear} fullWidth component={Link} to="/getqrcode">
        <CheckIcon fontSize='large' />
      </Button>
    </Grid>
    </Grid>
  </Box>
}

export default NewInstance
