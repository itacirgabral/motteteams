import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Link, useHistory } from "react-router-dom"
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'

import action from '../../redux/action'
import css from './css'

import NewInstanceHeader from '../../components/NewInstanceHeader'
import NewInstanceForm from '../../components/NewInstanceForm'
import NewInstanceWait from '../../components/NewInstanceWait'
import NewInstanceRead from '../../components/NewInstanceRead'
import NewInstanceAgreement from '../../components/NewInstanceAgreement'

const NewInstance = ({ state, dispatch }) => {
  const stl = css()
  const history = useHistory()

  const switchStage = (stage) => {
    switch(stage) {
      case 0:
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
        return <NewInstanceAgreement
          store={() => {
            dispatch(action.setNewinstanceStage({ stage: 0 }))
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
          }}
        />
      default:
        return <p>Stage 0</p>
    }
  }
  const navStage = (stage) => {
    switch (stage) {
      case 0:
        return <Grid container >
          <Grid item xs={6}>
            <Button fullWidth component={Link} to="/" onClick={() => dispatch(action.setNewinstanceStage({ stage: 0 }))}>
              <ClearIcon fontSize='large' />
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth onClick={() => {
              const iim = action.setNewinstanceStage({ stage: 1 })
              dispatch(iim)
            }}>
              <CheckIcon fontSize='large' />
            </Button>
          </Grid>
        </Grid>
      case 1:
        return null
      case 2:
        return null
      case 3:
        return <Grid container className={stl.footer} >
          <Button
            className={stl.add}
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => {
              dispatch(action.setNewinstanceStage({ stage: 0 }))
              history.push('/')
            }}
          >
            <ThumbUpIcon fontSize='large' />
          </Button>
        </Grid>
      default:
        return <p>stage = default</p>
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
    </Grid >
    {
      navStage(state.newinstance.stage)
    }

  </Box>
}

export default NewInstance
