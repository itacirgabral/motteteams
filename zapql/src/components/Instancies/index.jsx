import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import { Link } from "react-router-dom";

import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import NightsStayIcon from '@material-ui/icons/NightsStay';

import css from './css'

const Instancies = ({ state, dispatch }) => {
  const stl = css()

  console.log('state')
  console.dir(state)
  return <Box textAlign="center">
    <Typography component="h1" variant="h4" className={stl.header}>
      Instâncias
    </Typography>
    <List component="nav" className={stl.list}>
      {[
        <ListItem key="556599375661" button>
          <ListItemIcon>
            <NetworkCheckIcon />
          </ListItemIcon>
          <ListItemText primary="556599375661" />
        </ListItem>,

        <ListItem key="556593662936" button>
          <ListItemIcon>
            <NetworkCheckIcon />
          </ListItemIcon>
          <ListItemText primary="556593662936" />
        </ListItem>,

        ...Object.keys(state.instancies)
          .map(number => <ListItem key={number} button>
            <ListItemIcon>
              <NightsStayIcon />
            </ListItemIcon>
            <ListItemText primary={ number } />
          </ListItem>)
      ]}
    </List>
    <Button className={stl.add} fullWidth component={Link} to="/new">
      <AddAPhotoIcon fontSize='large' />
    </Button>
  </Box>
}

export default Instancies

/*
        ...Object.keys(state.instancies)
          .map(number => <ListItem button>
            <ListItemIcon>
              <NightsStayIcon />
            </ListItemIcon>
            <ListItemText primary={ number } />
          </ListItem>)
*/