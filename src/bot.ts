import Client from './Structures/Client'
import getConfig from './getConfig'
import Database from './Structures/Database'
import { Server } from './Structures/Server'
import { MessageHandler } from './Handlers/MessageHandler'
import { join } from 'path'
import Message from './Structures/Message'
;(async () => {
    if (!process.env.MONGO_URI) {
        console.error('No MONGO_URI found!')
        process.exit(1)
    }

    const database = new Database(process.env.MONGO_URI)
    await database.connect()
    const client = new Client(getConfig, database)
    const messageHandler = new MessageHandler(join(__dirname, 'Commands'), client)

    messageHandler.loadCommands()

    client.once('open', async () => {
        client.log('Connected to Whatsapp')
        console.table(client.user)
        await client.saveAuthInfo(client.base64EncodedAuthInfo())
    })
    const server = new Server(client)

    server.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${process.env.PORT || 3000}`))

    client.on('new-message', (M: Message) => {
        messageHandler.handle(M)
    })

    client.on('close', async ({ isReconnecting }) => {
        client.log('Disconnected from Whatsapp')
        client.log('Attempting to Reconnect')
        client.once('open', () => {
            client.log('Reconnected to Whatsapp')
        })
        if (!isReconnecting) await client.connect()
    })

    const authinfo = await client.getAuthInfo()
    if (authinfo) client.loadAuthInfo(authinfo)
    await client.connect()
})()
