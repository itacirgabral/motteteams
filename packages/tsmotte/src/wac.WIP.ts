// import makeWASocket, { BufferJSON, useSingleFileAuthState } from '@adiwajshing/baileys-md'
// import * as fs from 'fs'

// // utility function to help save the auth state in a single file
// // it's utility ends at demos -- as re-writing a large file over and over again is very inefficient
// const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json')
// // will use the given state to connect
// // so if valid credentials are available -- it'll connect without QR
// const conn = makeSocket({ auth: state }) 
// // this will be called as soon as the credentials are updated
// conn.ev.on ('creds.update', saveState)


/** stores the full authentication state in a single JSON file */
export const useSingleFileAuthState = (filename: string) => {
	// require fs here so that in case "fs" is not available -- the app does not crash
	const { readFileSync, writeFileSync, existsSync } = require('fs')

	let state: AuthenticationState = undefined

	// save the authentication state to a file
	const saveState = () => {
		console.log('saving auth state')
		writeFileSync(
			filename,
			// BufferJSON replacer utility saves buffers nicely
			JSON.stringify(state, BufferJSON.replacer, 2)
		)
	}
	
    if(existsSync(filename)) {
        const { creds, keys } = JSON.parse(
            readFileSync(filename, { encoding: 'utf-8' }), 
            BufferJSON.reviver
        )
        state = { 
            creds: creds, 
            // stores pre-keys, session & other keys in a JSON object
            // we deserialize it here
            keys: initInMemoryKeyStore(keys, saveState) 
        }
    } else {
        const creds = initAuthCreds()
        const keys = initInMemoryKeyStore({ }, saveState)
        state = { creds: creds, keys: keys }
    }

	return { state, saveState }
}