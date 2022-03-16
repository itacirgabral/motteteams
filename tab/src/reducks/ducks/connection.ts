const CONNECT = 'CONNECT'
const DISCONNECT = 'DISCONNECT'

const connect = (): { type: 'CONNECT'} => ({
  type: CONNECT
})

const disconnect = (): { type: 'DISCONNECT'} => ({
  type: DISCONNECT
})

const initialState = {
  websocketconnection: false
}

export type Actions = ReturnType<typeof connect> | ReturnType<typeof disconnect>

export const actions = {
  connect,
  disconnect
}

export const reducer = (state = initialState, action: Actions) => {
  switch (action.type) {
    case CONNECT:
      return {
        ...state,
        websocketconnection: true
      }
    case DISCONNECT:
      return {
        ...state,
        websocketconnection: false
      }
    default:
      return state
  }
}
