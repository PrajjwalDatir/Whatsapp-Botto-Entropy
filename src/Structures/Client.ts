import { WAConnection, WAMessage } from '@adiwajshing/baileys'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import Util from '../Helpers/Utils'
import { IClientConfig, ISession, IUser, JID } from '../typings/Client'
import Database from './Database'
import chalk from 'chalk'
import Message from './Message'
export default class Client extends WAConnection {
    qr?: string

    constructor(public config: IClientConfig, public database: Database) {
        super()
        this.on('qr', (qr) => (this.qr = qr))

        this.on('chat-update', (update) => {
            if (!update.messages) return void null
            const messages = update.messages.all()
            if (!messages[0]) return void null
            this.emitNewMessage(messages[0])
        })
    }

    private emitNewMessage = async (M: WAMessage) => {
        this.emit('new-message', await new Message(M, this).build())
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

    public saveAuthInfo = async (session: ISession): Promise<void> => {
        const filename = join('.', this.config.session.concat('_SESSION.json'))
        await writeFile(filename, JSON.stringify(session))
        await this.database.updateSession(this.config.session, session)
    }

    public getContact = (jid: string | JID): IUser => {
        const { notify, vname, name } = this.contacts[jid]
        return {
            username: notify || vname || name || '',
            jid,
            isMod: this.isMod(jid)
        }
    }

    public util = new Util()

    log = (...args: unknown[]): void => {
        console.log(chalk.blue(new Date().toString()), chalk.green(`[${this.config.session}]`), ...args)
    }
}
