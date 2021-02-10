import { useReducer } from 'react';
import { reducer, datazero } from './redux'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'

import Debug from './pages/Debug'

import Footer from './components/Footer'
import Instancies from './pages/Instancies'
import NewInstance from './pages/NewInstance'

import {
  BrowserRouter,
  Switch,
  Route
} from "react-router-dom";

import css from './css'


const App = () => {
  const stl = css()
  const [state, dispatch] = useReducer(reducer, datazero)

  return <Paper elevation={0} className={stl.root} >
    <Container component="main" className={stl.main} fixed maxWidth="xs">
      <Paper elevation={3}>
        <BrowserRouter>
          <Switch>
            <Route path="/newinstance">
              <NewInstance state={state} dispatch={dispatch}/>
            </Route>
            <Route path="/debug">
              <Debug />
            </Route>
            <Route path="/">
              <Instancies state={state} dispatch={dispatch} />
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
