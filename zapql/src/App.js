import { useReducer } from 'react';
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import Footer from './components/Footer'
import Instancies from './components/Instancies'
import NewInstance from './components/NewInstance'
import GetQRCode from './components/GetQRCode'

import {
  BrowserRouter,
  Switch,
  Route
} from "react-router-dom";

import css from './css'

const reducer = (state, action) => {
  switch (action.type) {
    case 'setNewinstanceHebhook':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          webhook: action.webhook 
        }
      }
    break
    default:
      throw new Error()
  }
} 

const datazero = {
  newinstance: {
    webhook: 'https://1234.ngrok.io/',
    selflog: true,
    rememberhere: true
  }
}

const App = () => {
  const stl = css()
  const [state, dispatch] = useReducer(reducer, datazero)

  return <Paper elevation={0} className={stl.root} >
    <Container component="main" className={stl.main} fixed maxWidth="xs">
      <Paper elevation={3}>
        <BrowserRouter>
          <Switch>
            <Route path="/getqrcode">
              <GetQRCode />
            </Route>
            <Route path="/new">
              <NewInstance state={state} dispatch={dispatch}/>
            </Route>
            <Route path="/">
              <Instancies />
            </Route>
          </Switch>
        </BrowserRouter>
      </Paper>
    </Container>
    <Container className={stl.footer} fixed>
      <Footer />
    </Container>
  </Paper>
}

export default App;
