import { combineReducers, createStore } from 'redux'
import connectionReducer from './ducks/connection'

const reducer = combineReducers({
  connected: connectionReducer
})
const store = createStore(reducer)

export default store
