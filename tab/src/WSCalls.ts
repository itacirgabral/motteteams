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

export const wscallMSTeamsUser = ({ websocket, jwt }: { websocket: WSref; jwt: string; }) => {
  console.dir({ jwt, wscall: 'MSTeamsUser' })
  websocket.current.send(JSON.stringify({
    type: 'msteams/user',
    jwt
  }))
}

export const wscallRegister = ({ websocket, channel }: { websocket: WSref; channel: string; }) => {
  console.dir({ channel, wscall: 'Register' })
  websocket.current.send(JSON.stringify({
    type: 'register',
    channel
  }))
}