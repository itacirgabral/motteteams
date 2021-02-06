import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import Link from "react-router-dom/Link";

import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import NightsStayIcon from '@material-ui/icons/NightsStay';

import css from './css'

const Instancies = () => {
  const stl = css()

  return <Box textAlign="center">
    <Typography component="h1" variant="h4" className={stl.header}>
      Instâncias
    </Typography>
    <List component="nav" className={stl.list}>
      <ListItem button>
        <ListItemIcon>
          <NetworkCheckIcon />
        </ListItemIcon>
        <ListItemText primary="(65) 9 9937-5661" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <NetworkCheckIcon />
        </ListItemIcon>
        <ListItemText primary="(65) 9 9366-2936" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <NightsStayIcon />
        </ListItemIcon>
        <ListItemText primary="(65) 9 9691-0295" />
      </ListItem>
    </List>
    <Button className={stl.add} fullWidth component={Link} to="/new">
      <AddAPhotoIcon fontSize='large' />
    </Button>
  </Box>
}

export default Instancies
