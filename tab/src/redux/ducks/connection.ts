const CONNECT = 'CONNECT'
const DISCONNECT = 'DISCONNECT'

const connect = () => ({
  type: CONNECT
})

const disconnect = () => ({
  type: DISCONNECT
})

const initialState = {
  connected: false
}

type ActionsConnection = ReturnType<typeof connect> | ReturnType<typeof disconnect>

const reducer = (state = initialState, action: ActionsConnection) => {
  switch (action.type) {
    case CONNECT:
      return {
        ...state,
        connected: true
      }
      break
    case DISCONNECT:
      return {
        ...state,
        connected: false
      }
      break
    default:
      return state
  }
}

export default reducer