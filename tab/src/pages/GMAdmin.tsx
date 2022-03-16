import React from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Image, Button, Header, Flex, Segment } from "@fluentui/react-northstar";
import Login from '../components/LogIn'
import { State } from '../reducks'

type Props = {
  state: State
  websocket: React.MutableRefObject<ReconnectingWebSocket>
}

const GMAdmin = ({ state, websocket }: Props) => <Flex column>
  <Image
    style={{ margin: '1rem auto'}}
    src="https://gestormessengerfiles.nyc3.digitaloceanspaces.com/GestorSistemasEngrenagemLogo.png"
  />
  <Header
    style={{ margin: '1rem auto', textAlign: 'center'}}
    content="Gestor Sistemas"
    description="Configure o acesso ao Gestor Messenger, importe seus dados e gerencie os whatsapp"
  />
  {
    state.gestorsistemas.useronline ?
    <p>{ state.gestorsistemas.userdata }</p> :
    <Login websocket={websocket} />
}
</Flex>

export default GMAdmin