import React, { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Provider, teamsTheme } from "@fluentui/react-northstar";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";

import { useTeamsFx } from "./useTeamsFx";
import DashboadGestorMessenger from "./DashboadGestorMessenger";

export default function App() {
  const [isConnected, setConnected] = useState(false)
  const [isGSConnected, setGSConnected] = useState(false)
  const ref = useRef({} as ReconnectingWebSocket)

  useEffect(() => {
    const jwt = window.localStorage.getItem('jwt');
    const whatsapp = window.localStorage.getItem('whatsapp');
    const host = window.localStorage.getItem('host') || 'wss://ws.gm.inf.br'

    const ws = new  ReconnectingWebSocket(`${host}/teamstap?jwt=${jwt}&whatsapp=${whatsapp}`)
    ref.current = ws

    ws.onopen = async ev => {
      console.dir({ on: 'open', ev, ws })
      setConnected(true)
    }

    ws.onmessage = async ev => {
      console.dir({ on: 'message', ev })
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
        <DashboadGestorMessenger  isGSConnected={isGSConnected} setGSConnected={setGSConnected}/>
      </Route>
    </Router>
  </Provider>
}
