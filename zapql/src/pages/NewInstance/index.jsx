import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Link } from "react-router-dom"
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'

import action from '../../redux/action'
import css from './css'

import NewInstanceHeader from '../../components/NewInstanceHeader'
import NewInstanceForm from '../../components/NewInstanceForm'
import NewInstanceWait from '../../components/NewInstanceWait'
import NewInstanceRead from '../../components/NewInstanceRead'
import NewInstanceAgreement from '../../components/NewInstanceAgreement'

const NewInstance = ({ state, dispatch }) => {
  const stl = css()

  const actualStage = state.newinstance.stage
  const switchStage = stage => {
    switch(stage) {
      case 0:
        // const { remember, webhook, setRemember, setHebhook } = props
        return <NewInstanceForm
          remember={state.newinstance.remember}
          webhook={state.newinstance.webhook}
          setRemember={el => dispatch(action.setNewinstanceRemember({ remember: el }))}
          setHebhook={el => dispatch(action.setNewinstanceHebhook({ webhook: el }))}
        />
      case 1:
        return <NewInstanceWait
          webhook={state.newinstance.webhook}
          remember={state.newinstance.remember}
          selflog={state.newinstance.selflog}
          gotcode={qr => {
            dispatch(action.setNewinstanceQRCode({ qr }))
            dispatch(action.setNewinstanceStage({ stage: 2 }))
          }}
        />
      case 2:
        return <NewInstanceRead
          qr={state.newinstance.qr}
          gotscan={({ number, name, avatar, jwt }) => {
            dispatch(action.setNewinstanceStage({ stage: 3 }))
            if (state.newinstance.remember) {
              dispatch(action.setNewinstanceNumber({ number }))
              dispatch(action.setNewinstanceName({ name }))
              dispatch(action.setNewinstanceAvatar({ avatar }))
              dispatch(action.setNewinstanceJwt({ jwt }))

              dispatch(action.setNewinstance({ number, name, avatar, jwt }))
            }
          }}
        />
      case 3:
        return <NewInstanceAgreement store={() => {
          if(state.newinstance.remember) {
            /*
              // store on localstorage
              [state.newinstance.number]: {
                name: state.newinstance.name,
                avatar: state.newinstance.avatar,
                jwt: state.newinstance.jwt
              }
            */
          }
        }}/>
      default:
        return <p>Stage 0</p>
    }
  }

  return <Box textAlign="center">
    <NewInstanceHeader />
    <Grid container>
      <Grid item xs={12}>
      {
        switchStage(state.newinstance.stage)
      }
      </Grid>
    </Grid>
    <Grid container >
      <Grid item xs={6}>
        <Button fullWidth component={Link} to="/" onClick={() => dispatch(action.setNewinstanceStage({ stage: 0 }))}>
          <ClearIcon fontSize='large' />
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button fullWidth onClick={() => {
          const nextStage = actualStage === 3 ? 0 : actualStage + 1
          const iim = action.setNewinstanceStage({ stage: nextStage })
          dispatch(iim)
        }}>
          <CheckIcon fontSize='large' />
        </Button>
      </Grid>
    </Grid>
  </Box>
}

export default NewInstance
