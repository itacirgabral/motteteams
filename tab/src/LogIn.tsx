import React, { useState } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Form, FormInput, FormButton } from "@fluentui/react-northstar";

type Props = {
  websocket: React.MutableRefObject<ReconnectingWebSocket>
}

const Login = ({ websocket }: Props) => {
  const [isLoading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  return <Form
    style={{ margin: '1rem auto', textAlign: 'center'}}
    onSubmit={() => {
      setLoading(true)
      console.dir({ email, senha })
      websocket.current.send(JSON.stringify({
        type: 'gestorsistema/auth/login',
        email,
        senha
      }))
    }}
    >
    <FormInput
      label="E-mail"
      name="email"
      required
      onChange={(ev, data) => {
        setEmail(data?.value || '')
      }}
      disabled={ isLoading }
    />
    <FormInput
      label="Senha"
      name="senha"
      required
      type="password"
      onChange={(ev, data) => {
        setSenha(data?.value || '')
      }}
      disabled={ isLoading }
    />
    <FormButton content="Login" disabled={ isLoading }/>
  </Form>
}

export default Login