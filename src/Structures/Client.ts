import { WAConnection } from '@adiwajshing/baileys'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { IClientConfig, ISession, JID } from '../typings/Client'
import Database from './Database'

export default class Client extends WAConnection {
    qr?: string

    constructor(public config: IClientConfig, public database: Database) {
        super()
        this.on('qr', (qr) => (this.qr = qr))
    }

    public isMod = (jid: string | JID): boolean => this.config.mods.includes(jid)

    public getAuthInfo = async (): Promise<ISession | undefined> => {
        const filename = join('.', this.config.session.concat('_SESSION.json'))
        if (existsSync(filename)) {
            const data = JSON.parse(await readFile(filename, { encoding: 'utf8' }))
            await this.database.updateSession(this.config.session, data)
            return data
        }
        const { session } = (await this.database.getSession(this.config.session)) || {}
        if (!session) return undefined
        await writeFile(filename, JSON.stringify(session))
        return session
    }
}
