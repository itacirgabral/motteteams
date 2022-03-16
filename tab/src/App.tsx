import React, { useEffect, useRef, useState, useReducer } from "react";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";

import * as microsoftTeams from '@microsoft/teams-js';
import { Provider, teamsTheme } from "@fluentui/react-northstar";

import ReconnectingWebSocket from 'reconnecting-websocket';
import { wscallMSTeamsUser, wscallRegister } from './WSCalls'
import { useTeamsFx } from "./useTeamsFx";

import * as Redux from './reducks'
import * as DuckConnection from './reducks/ducks/connection'
import * as DuckGSAuth from './reducks/ducks/gestorsistemas.auth'

// Pages
import GMAdmin from './pages/GMAdmin'
import GMBotConf from './pages/GMBotConf'
import GestorMessenger from './pages/GestorMessenger'
import Privacidade from './pages/Privacidade'
import TermosUso from './pages/TermosUso'

export default function App() {
  const [state, dispatch] = useReducer(Redux.reducer, Redux.initialState)
  const websocket = useRef({} as ReconnectingWebSocket)

  useEffect(() => {
    const jwt = window.localStorage.getItem('jwt');
    const whatsapp = window.localStorage.getItem('whatsapp');
    const host = window.localStorage.getItem('host') || 'wss://ws.gm.inf.br'
    const user = window.localStorage.getItem('user');

    if (user) {
      dispatch(DuckGSAuth.actions.gsSetUserData({ data: user }))
      dispatch(DuckGSAuth.actions.gsSetUserOn())
    }

    const ws = new  ReconnectingWebSocket(`${host}/teamstap?jwt=${jwt}&whatsapp=${whatsapp}`)
    websocket.current = ws

    ws.onopen = async ev => {
      console.dir({ on: 'open', ev, ws })
      dispatch(DuckConnection.actions.connect())
      wscallRegister({ websocket, channel: 'onlineuser' })
      microsoftTeams.authentication.getAuthToken({
        resources: [process.env.SSOTAB_APP_URI || ''],
        successCallback: msTToken => {
          // todo se o token for igual ao do estado, não enviar.
          wscallMSTeamsUser({ websocket, jwt: msTToken})
        }
      })
    }

    ws.onmessage = async ev => {
      console.dir({ on: 'message', ev })
      const data = ev.data
      try {
        const message = JSON.parse(data)
        switch (message.type) {
          case 'gestorsistema/user':
            console.log('gestorsistema/user')
            dispatch(DuckGSAuth.actions.gsSetUserData({ data }))
            dispatch(DuckGSAuth.actions.gsSetUserOn())
            window.localStorage.setItem('user', data)
            break
        }
      } catch (err) {
        console.error(err)
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const { theme, loading } = useTeamsFx();

  return <Provider theme={theme || teamsTheme} styles={{ backgroundColor: "#eeeeee" }}><Router>
      <Route exact path="/">
        <GestorMessenger />
      </Route>
      <Route exact path="/privacy">
        <Privacidade />
      </Route>
      <Route exact path="/termsofuse">
        <TermosUso />
      </Route>
      <Route exact path="/gmadminpersonaltab">
        <GMAdmin
          state={state}
          websocket={websocket}
        />
      </Route>
      <Route exact path="/botconfteamtab">
        <GMBotConf />
      </Route>
    </Router>
  </Provider>
}
