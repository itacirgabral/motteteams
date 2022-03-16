import { initialState } from '../index'

// slug
const GSSETUSERON = 'GSSETUSERON'
const GSSETUSERDATA = 'GSSETUSERDATA'

// actions
const gsSetUserOn = (): { type: 'GSSETUSERON'} => ({
  type: GSSETUSERON
})
const gsSetUserData = ({ data }: { data: string }): { type: 'GSSETUSERDATA', data: string } => ({
  type: GSSETUSERDATA,
  data
})
export const actions = {
  gsSetUserOn,
  gsSetUserData
}
export type Actions = ReturnType<typeof gsSetUserOn> | ReturnType<typeof gsSetUserData>

// reducer
export const reducer = (state = initialState, action: Actions) => {
  switch (action.type) {
    case GSSETUSERON:
      return {
        ...state,
        gestorsistemas: {
          ...state.gestorsistemas,
          useronline: true
        }
      }
    case GSSETUSERDATA:
      return {
        ...state,
        gestorsistemas: {
          ...state.gestorsistemas,
          data: action.data
        }
      }
    default:
      return state
  }
}
