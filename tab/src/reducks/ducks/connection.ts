import { initialState } from '../index'

// slug
const CONNECT = 'CONNECT'
const DISCONNECT = 'DISCONNECT'

// actions
const connect = (): { type: 'CONNECT'} => ({
  type: CONNECT
})
const disconnect = (): { type: 'DISCONNECT'} => ({
  type: DISCONNECT
})
export const actions = {
  connect,
  disconnect
}
export type Actions = ReturnType<typeof connect> | ReturnType<typeof disconnect>

// reducer
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
