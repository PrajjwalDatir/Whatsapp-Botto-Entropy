/* eslint-disable @typescript-eslint/no-explicit-any */
import create, { WAMessage, Contact, SocketConfig, DisconnectReason, BaileysEventMap } from '@adiwajshing/baileys'
import Util from '../Helpers/Utils'
import { IClientConfig, IUser, JID } from '../typings/Client'
import Database from './Database'
import chalk from 'chalk'
import Message from './Message'
import EventEmitter from 'events'
import { Boom } from '@hapi/boom'

export type Baileys = ReturnType<typeof create>

export type BailKeys = keyof Baileys
// see what i did there?

export default class Client extends EventEmitter implements Baileys {
    public qr?: string

    public contacts: Record<string, Contact> = {}

    private sock?: Baileys

    public state = 'close'

    constructor(public config: IClientConfig, public database: Database, private sconfig: Partial<SocketConfig> = {}) {
        super()
        this.ev = new EventEmitter()
    }

    private eventStore = new Map<string | symbol, (...args: any[]) => any>()

    public on = (...args: Parameters<EventEmitter['on']>): this => {
        this.eventStore.set(args[0], args[1])
        this.ev.on(args[0] as keyof BaileysEventMap, args[1])
        return this
    }

    public emit = (...args: Parameters<EventEmitter['emit']>): boolean => {
        this.ev.emit(args[0] as keyof BaileysEventMap, args[1])
        return true
    }

    public loadAuth = (auth: SocketConfig['auth']): void => {
        this.sconfig.auth = auth
    }

    connect = async (): Promise<void> => {
        this.sock = create(this.sconfig)

        for (const key in this.sock) {
            this[key as keyof this] = this.sock[key as keyof Baileys]
        }

        this.eventStore.forEach((value, key) => {
            this.ev.on(key as keyof BaileysEventMap, value)
        })

        this.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update
            if (qr) this.qr = qr
            if (
                connection === 'close' &&
                (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            )
                return this.connect()
            if (connection === 'open') return this.emit('open')
        })

        this.ev.on('contacts.upsert', (contacts) => {
            console.log(contacts)
            for (const contact of contacts) {
                this.contacts[contact.id] = contact
            }
        })

        this.ev.on('contacts.update', (contacts) => {
            for (const contact of contacts) {
                if (contact.id) {
                    const c = this.contacts[contact.id] || {}
                    for (const key of Object.keys(contact)) {
                        const data = contact[key as keyof Contact]
                        if (data) c[key as keyof Contact] = data
                    }
                }
            }
        })

        this.ev.on('messages.upsert', ({ messages }) => {
            this.emitNewMessage(messages[0])
        })
    }

    private emitNewMessage = async (M: WAMessage) => {
        this.emit('new.message', await new Message(M, this).build())
    }

    public isMod = (jid: string | JID): boolean => this.config.mods.includes(jid)

    public getContact = (jid: string | JID): IUser => {
        const { notify, verifiedName, name } = this.contacts[jid] || {}
        return {
            username: notify || verifiedName || name || '',
            jid,
            isMod: this.isMod(jid)
        }
    }

    public util = new Util()

    log = (...args: unknown[]): void => {
        console.log(chalk.blue(new Date().toString()), chalk.green(`[${this.config.session}]`), ...args)
    }

    /* Temp Implement Baileys */
    public appPatch = ((): void => void null) as unknown as Baileys['appPatch']
    public sendPresenceUpdate = ((): void => void null) as unknown as Baileys['sendPresenceUpdate']
    public presenceSubscribe = ((): void => void null) as unknown as Baileys['presenceSubscribe']
    public profilePictureUrl = ((): void => void null) as unknown as Baileys['profilePictureUrl']
    public onWhatsApp = ((): void => void null) as unknown as Baileys['onWhatsApp']
    public fetchBlocklist = ((): void => void null) as unknown as Baileys['fetchBlocklist']
    public fetchPrivacySettings = ((): void => void null) as unknown as Baileys['fetchPrivacySettings']
    public fetchStatus = ((): void => void null) as unknown as Baileys['fetchStatus']
    public updateProfilePicture = ((): void => void null) as unknown as Baileys['updateProfilePicture']
    public updateBlockStatus = ((): void => void null) as unknown as Baileys['updateBlockStatus']
    public resyncState = ((): void => void null) as unknown as Baileys['resyncState']
    public chatModify = ((): void => void null) as unknown as Baileys['chatModify']
    public processMessage = ((): void => void null) as unknown as Baileys['processMessage']
    public assertSession = ((): void => void null) as unknown as Baileys['assertSession']
    public relayMessage = ((): void => void null) as unknown as Baileys['relayMessage']
    public sendReadReceipt = ((): void => void null) as unknown as Baileys['sendReadReceipt']
    public refreshMediaConn = ((): void => void null) as unknown as Baileys['refreshMediaConn']
    public sendMessage = ((): void => void null) as unknown as Baileys['sendMessage']
    public groupMetadata = ((): void => void null) as unknown as Baileys['groupMetadata']
    public groupCreate = ((): void => void null) as unknown as Baileys['groupCreate']
    public groupLeave = ((): void => void null) as unknown as Baileys['groupLeave']
    public groupUpdateSubject = ((): void => void null) as unknown as Baileys['groupUpdateSubject']
    public groupParticipantsUpdate = ((): void => void null) as unknown as Baileys['groupParticipantsUpdate']
    public groupInviteCode = ((): void => void null) as unknown as Baileys['groupInviteCode']
    public groupToggleEphemeral = ((): void => void null) as unknown as Baileys['groupToggleEphemeral']
    public groupSettingUpdate = ((): void => void null) as unknown as Baileys['groupSettingUpdate']
    public ws = ((): void => void null) as unknown as Baileys['ws']
    public ev = ((): void => void null) as unknown as Baileys['ev']
    public authState = ((): void => void null) as unknown as Baileys['authState']
    public user = ((): void => void null) as unknown as Baileys['user']
    public assertingPreKeys = ((): void => void null) as unknown as Baileys['assertingPreKeys']
    public generateMessageTag = ((): void => void null) as unknown as Baileys['generateMessageTag']
    public query = ((): void => void null) as unknown as Baileys['query']
    public waitForMessage = ((): void => void null) as unknown as Baileys['waitForMessage']
    public waitForSocketOpen = ((): void => void null) as unknown as Baileys['waitForSocketOpen']
    public sendRawMessage = ((): void => void null) as unknown as Baileys['sendRawMessage']
    public sendNode = ((): void => void null) as unknown as Baileys['sendNode']
    public logout = ((): void => void null) as unknown as Baileys['logout']
    public end = ((): void => void null) as unknown as Baileys['end']
    public waitForConnectionUpdate = ((): void => void null) as unknown as Baileys['waitForConnectionUpdate']
    public groupFetchAllParticipating = ((): void => void null) as Baileys['groupFetchAllParticipating']
}
