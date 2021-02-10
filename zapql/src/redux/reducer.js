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
    case 'setNewinstanceRemember':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          remember: action.remember
        }
      }
    break
    case 'setNewinstanceStage':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          stage: action.stage
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
    case 'setNewinstanceNumber':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          number: action.number
        }
      }
    break
    case 'setNewinstanceName':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          name: action.name
        }
      }
    break
    case 'setNewinstanceAvatar':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          avatar: action.avatar
        }
      }
    break
    case 'setNewinstanceJwt':
      return {
        ...state,
        newinstance: {
          ...state.newinstance,
          jwt: action.jwt
        }
      }
    break
    case 'setNewinstance':
      return {
        ...state,
        instancies: {
          ...state.instancies,
          [action.number]: {
            jwt: action.jwt,
            name: action.name,
            avatar: action.avatar,
          }
        }
      }
      break
    default:
      throw new Error()
  }
}

export default reducer
