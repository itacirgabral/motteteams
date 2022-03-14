import React from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Header, Flex } from "@fluentui/react-northstar";

type Props = {
  isGSConnected: boolean;
  websocket: React.MutableRefObject<ReconnectingWebSocket>;
}
const Botconfteamtab = ({ isGSConnected, websocket }: Props) => <Flex column>
  <Header
    style={{ margin: '1rem auto', textAlign: 'center'}}
    content="Configure BOT"
    description="Configure atendimentos para instâncias"
  />

</Flex>

export default Botconfteamtab