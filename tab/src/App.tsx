import React, { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as microsoftTeams from '@microsoft/teams-js';
import { Provider, teamsTheme } from "@fluentui/react-northstar";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";

import { useTeamsFx } from "./useTeamsFx";
import DashboadGestorMessenger from "./DashboadGestorMessenger";

export default function App() {
  const [isConnected, setConnected] = useState(false)
  const [gsuser, setGsuser] = useState('')
  const [isGSConnected, setGSConnected] = useState(false)
  const websocket = useRef({} as ReconnectingWebSocket)

  useEffect(() => {
    const jwt = window.localStorage.getItem('jwt');
    const whatsapp = window.localStorage.getItem('whatsapp');
    const host = window.localStorage.getItem('host') || 'wss://ws.gm.inf.br'
    const user = window.localStorage.getItem('user');

    if (user) {
      setGsuser(user)
      setGSConnected(true)
    }
    const ws = new  ReconnectingWebSocket(`${host}/teamstap?jwt=${jwt}&whatsapp=${whatsapp}`)
    websocket.current = ws

    ws.onopen = async ev => {
      console.dir({ on: 'open', ev, ws })

      setConnected(true)

      ws.send(JSON.stringify({
        type: 'register',
        channel: 'onlineuser'
      }))

      microsoftTeams.authentication.getAuthToken({
        resources: [process.env.SSOTAB_APP_URI || ''],
        successCallback: msTToken => {
          // se o token for igual ao do estado, não enviar.
          ws.send(JSON.stringify({
            type: 'msteams/user',
            jwt: msTToken
          }))
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
            setGSConnected(true)
            setGsuser(data)
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
        <Redirect to="/dash" />
      </Route>
      <Route exact path="/dash">
        <DashboadGestorMessenger
          websocket={websocket}
          isGSConnected={isGSConnected}
          setGSConnected={setGSConnected}
          gsuser={gsuser}
        />
      </Route>
    </Router>
  </Provider>
}
