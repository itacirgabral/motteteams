import type { AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from '@adiwajshing/baileys-md'
import type { Logger } from 'pino'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { BufferJSON, initAuthCreds, proto } from '@adiwajshing/baileys-md'

const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
}

const useSingleFileAuthState = (filename: string, logger?: Logger): { state: AuthenticationState, saveState: () => void } => {
  let creds: AuthenticationCreds
  let keys: any = { }

  const saveState = () => {
    logger && logger.trace('saving auth state')
    writeFileSync(
      filename,
      JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
    )
  }

  if(existsSync(filename)) {
    const result = JSON.parse(
      readFileSync(filename, { encoding: 'utf-8' }),
      BufferJSON.reviver
    )
    creds = result.creds
    keys = result.keys
  } else {
      creds = initAuthCreds()
      keys = { }
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type]
          return ids.reduce(
            (dict, id) => {
              let value = keys[key]?.[id]
              if(value) {
                if(type === 'app-state-sync-key') {
                  value = proto.AppStateSyncKeyData.fromObject(value)
                }
                dict[id] = value
              }
              return dict
            }, { }
          )
        },
        set: (data) => {
          for(const _key in data) {
            const key = KEY_MAP[_key as keyof SignalDataTypeMap]
            keys[key] = keys[key] || { }
            Object.assign(keys[key], data[_key])
          }
          saveState()
        }
      }
    },
    saveState
  }
}

export default useSingleFileAuthState
