import * as Connection from './ducks/connection'
import * as GSAuth from './ducks/gestorsistemas.auth'

// export type Actions = X.Actions | y.Actions | z.Actions
export type Actions = Connection.Actions | GSAuth.Actions

interface State {
  websocketconnection: boolean;
  gestorsistemas: {
    userdata?: string;
    useronline: boolean;
  }
}

export const initialState: State = {
  websocketconnection: false,
  gestorsistemas: {
    useronline: false
  }
}

export const reducer = function reducer(state:  State, action: Actions) {
  switch (action.type) {
    case 'CONNECT':
    case 'DISCONNECT':
      return {
        ...state,
        ...Connection.reducer(state, action)
      }
    //
    case 'GSSETUSERDATA':
    case 'GSSETUSERON':
      return {
        ...state,
        ...GSAuth.reducer(state, action)
      }
    default:
      return state
  }
}
