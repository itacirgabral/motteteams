import React, {useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
// https://fluentsite.z22.web.core.windows.net/quick-start
import { Provider, teamsTheme, Loader } from "@fluentui/react-northstar";
import { HashRouter as Router, Redirect, Route } from "react-router-dom";
import { useTeamsFx } from "./sample/lib/useTeamsFx";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import Tab from "./Tab";
import "./App.css";
import TabConfig from "./TabConfig";

/**
 * The main app which handles the initialization and routing
 * of the app.
 */
export default function App() {
  const [isConnected, setConnected] = useState(false)
  const ref = useRef({} as ReconnectingWebSocket)

  useEffect(() => {
    // const ws = new WebSocket('ws://localhost:8080')
    const ws = new  ReconnectingWebSocket('wss://ws.gm.inf.br/')
    ref.current = ws

    ws.onopen = async ev => {
      console.dir({ on: 'open', ev, ws })
      setConnected(true)
    }

    ws.onmessage = async ev => {
      console.dir({ on: 'message', ev })
    }

    return () => {
      // cleanup
    }
  }, [])

  const { theme, loading } = useTeamsFx();
  return (
    <Provider theme={theme || teamsTheme} styles={{ backgroundColor: "#eeeeee" }}>
      <p>isConnected={isConnected ? 'sim' : 'não'}</p>
      <Router>
        <Route exact path="/">
          <Redirect to="/tab" />
        </Route>
        {loading ? (
          <Loader style={{ margin: 100 }} />
        ) : (
          <>
            <Route exact path="/privacy" component={Privacy} />
            <Route exact path="/termsofuse" component={TermsOfUse} />
            <Route exact path="/tab" component={Tab} />
            <Route exact path="/config" component={TabConfig} />
          </>
        )}
      </Router>
    </Provider>
  );
}
