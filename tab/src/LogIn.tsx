import React from "react";
import { Form, Button, FormInput, FormButton } from "@fluentui/react-northstar";

type Props = {
  setGSConnected: React.Dispatch<React.SetStateAction<boolean>>
}

const Login = ({ setGSConnected }: Props) => <Form style={{ margin: '1rem auto', textAlign: 'center'}} >
  <FormInput label="E-mail" name="email" required />
  <FormInput label="Senha" name="senha" required type="password" />
  <FormButton content="Login" onClick={() => {
      console.log("opa")
  }}/>
</Form>

export default Login
