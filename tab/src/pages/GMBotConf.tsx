import React from "react";
import { Header, Flex } from "@fluentui/react-northstar";

type Props = {

}

const GMBotConf = (props: Props) => <Flex column>
  <Header
    style={{ margin: '1rem auto', textAlign: 'center'}}
    content="Configure BOT"
    description="Configure atendimentos para instâncias"
  />
</Flex>

export default GMBotConf