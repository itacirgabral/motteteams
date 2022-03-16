import * as Connection from './ducks/connection'

// export type Actions = X.Actions | y.Actions | z.Actions
export type Actions = Connection.Actions

interface State {
  websocketconnection: boolean;
}

export const initialState: State = {
  websocketconnection: false
}

export const reducer = function reducer(state:  State, action: Actions) {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        ...Connection.reducer(state, action)
      }
      case 'DISCONNECT':
        return {
          ...state,
          ...Connection.reducer(state, action)
        }
      //
    default:
      return state
  }
}
