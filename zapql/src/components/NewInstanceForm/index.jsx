import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import css from './css'

const NewInstance = ({ remember, webhook, setRemember, setHebhook }) => {

  const stl = css()
  return <FormControl className={stl.form}>
    <FormControlLabel id="checkboxautomensagem"
      control={<Checkbox checked={true} name="automensagem" />}
      label="Enviar Auto Mensagem"
    />
    <FormControlLabel id="checkboxlembrar"
      control={<Checkbox checked={remember} name="lembrar" />}
      label="Lembrar da instância"
      onChange={ev => setRemember(ev.target.checked)}
    />
    <TextField
      id="inputwebhook"
      value={webhook}
      label="webhook url"
      onChange={ev => setHebhook(ev.target.value)}
    />
  </FormControl>
}

export default NewInstance
