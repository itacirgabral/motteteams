import React from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Image, Button, Header, Flex, Segment } from "@fluentui/react-northstar";
import Login from '../components/LogIn'

type Props = {
  isGSConnected: boolean;
  setGSConnected: React.Dispatch<React.SetStateAction<boolean>>;
  websocket: React.MutableRefObject<ReconnectingWebSocket>;
  gsuser: string;
}

const GMAdmin = ({ isGSConnected, setGSConnected, websocket, gsuser }: Props) => <Flex column>
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
    isGSConnected ?
    <p>{gsuser}</p> :
      <Login websocket={websocket} />
}
</Flex>

export default GMAdmin