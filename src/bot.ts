import Client from './Structures/Client'
import getConfig from './getConfig'
import Database from './Structures/Database'
import { MessageHandler } from './Handlers/MessageHandler'
import { join } from 'path'
import P from 'pino'
import { getAuthInfo, saveAuthInfo } from './authInfo'
import { initInMemoryKeyStore } from '@adiwajshing/baileys'
import Message from './Structures/Message'
import { Server } from './Structures/Server'
;(async () => {
    if (!process.env.MONGO_URI) {
        console.error('No MONGO_URI found!')
        process.exit(1)
    }

    const database = new Database(process.env.MONGO_URI)
    await database.connect()
    const config = getConfig()

    const save = async (state: unknown) => await saveAuthInfo(database, config.session, state)

    const { creds, keys } = (await getAuthInfo(database, config.session)) || {}

    const client = new Client(config, database, {
        printQRInTerminal: true,
        logger: P({
            level: 'fatal'
        })
    })

    if (creds && keys)
        client.loadAuth({
            creds,
            keys: initInMemoryKeyStore(keys)
        })

    client.on('auth-state.update', () => {
        client.loadAuth(client.authState)
        save(client.authState)
    })
    const messageHandler = new MessageHandler(join(__dirname, 'Commands'), client)
    messageHandler.loadCommands()

    const server = new Server(client)
    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => client.log(`Server Listening on port ${PORT}`))

    client.on('new.message', (M: Message) => {
        messageHandler.handle(M)
    })

    await client.connect()
})()
