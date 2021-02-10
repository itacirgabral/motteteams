const action = {
  setNewinstanceHebhook: ({ webhook }) => ({
    type: 'setNewinstanceHebhook',
    webhook
  }),
  setNewinstanceRemember: ({ remember }) => ({
    type: 'setNewinstanceRemember',
    remember
  }),
  setNewinstanceStage: ({ stage }) => ({
    type: 'setNewinstanceStage',
    stage
  }),
  setNewinstanceQRCode: ({ qr }) => ({
    type: 'setNewinstanceQRCode',
    qr
  }),
  setNewinstanceNumber: ({ number }) => ({
    type: 'setNewinstanceNumber',
    number
  }),
  setNewinstanceName: ({ name }) => ({
    type: 'setNewinstanceName',
    name
  }),
  setNewinstanceAvatar: ({ avatar }) => ({
    type: 'setNewinstanceAvatar',
    avatar
  }),
  setNewinstanceJwt: ({ jwt }) => ({
    type: 'setNewinstanceJwt',
    jwt
  }),
  setNewinstance: ({ number, jwt, name, avatar }) => ({
    type: 'setNewinstance',
    number,
    jwt,
    name,
    avatar
  })
}

export default action

