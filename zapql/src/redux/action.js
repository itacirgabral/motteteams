const action = {
  setNewinstanceHebhook: ({ webhook }) => ({
    type: 'setNewinstanceHebhook',
    webhook
  }),
  setNewinstanceRememberhere: ({ rememberhere }) => ({
    type: 'setNewinstanceRememberhere',
    rememberhere
  }),
  setNewinstanceQRCode: ({ qr }) => ({
    type: 'setNewinstanceQRCode',
    qr
  }),
  setNewinstance: ({ number }) => ({
    type: 'setNewinstance',
    number
  })
}

export default action

