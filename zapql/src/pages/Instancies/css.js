import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(2),
  },
  paper: {
    alignItems: 'center'
  },
  add: {
    padding: theme.spacing(2)
  },
  list: {
    minHeight: '18rem'
  }
}))

export default useStyles
