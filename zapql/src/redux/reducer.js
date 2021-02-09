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
    case 'setNewinstanceRememberhere':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          rememberhere: action.rememberhere
        }
      }
    break
    case 'setNewinstanceQRCode':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          qr: action.qr
        }
      }
      break
    case 'setNewinstance':
      return {
        ...state,
        instancies: {
          ...state.instancies,
          [action.number]: { }
        }
      }
      break
    default:
      throw new Error()
  }
}

export default reducer
