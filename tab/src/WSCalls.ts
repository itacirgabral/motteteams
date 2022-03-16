import React from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';

type WSref = React.MutableRefObject<ReconnectingWebSocket>

export const wscallGSAuthLogin = ({ websocket, email, senha }: { websocket: WSref; email: string; senha: string; }) => {
  console.dir({ email, senha, wscall: 'GSAuthLogin' })
  websocket.current.send(JSON.stringify({
    type: 'gestorsistema/auth/login',
    email,
    senha
  }))
}
