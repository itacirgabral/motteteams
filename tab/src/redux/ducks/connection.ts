const CONNECT = 'CONNECT'
const DISCONNECT = 'DISCONNECT'

const connect = () => ({
  type: CONNECT
})

const disconnect = () => ({
  type: DISCONNECT
})

const initialState = {
  isConnected: false
}

export type ActionsConnection = ReturnType<typeof connect> | ReturnType<typeof disconnect>

export const actionsConnection = {
  connect,
  disconnect
}

const reducer = (state = initialState, action: ActionsConnection) => {
  switch (action.type) {
    case CONNECT:
      return {
        ...state,
        isConnected: true
      }
      break
    case DISCONNECT:
      return {
        ...state,
        isConnected: false
      }
      break
    default:
      return state
  }
}

export default reducer