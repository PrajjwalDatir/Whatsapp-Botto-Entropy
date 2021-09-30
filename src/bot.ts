import Client from './Structures/Client'
import getConfig from './getConfig'
import Database from './Structures/Database'
import { Server } from './Structures/Server'
;(async () => {
    if (!process.env.MONGO_URI) {
        console.error('No MONGO_URI found!')
        process.exit(1)
    }

    const database = new Database(process.env.MONGO_URI)
    await database.connect()
    const client = new Client(getConfig, database)

    const server = new Server(client)

    server.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${process.env.PORT || 3000}`))

    await client.connect()
})()
