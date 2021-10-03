/* eslint-disable @typescript-eslint/no-explicit-any */
import create, { WAMessage, Contact, SocketConfig, DisconnectReason, BaileysEventMap } from '@adiwajshing/baileys'
import Util from '../Helpers/Utils'
import { IClientConfig, IUser, JID } from '../typings/Client'
import Database from './Database'
import chalk from 'chalk'
import Message from './Message'
import EventEmitter from 'events'
import { Boom } from '@hapi/boom'
import { BAILEYS_METHODS } from '../Constants'

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

        for (const method of BAILEYS_METHODS) {
            this[method] = (() => {
                throw new Error(`${method} cannot be called without connecting`)
            }) as Baileys[typeof method]
        }
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

    /* Temp Baileys Implementation*/
    public appPatch!: Baileys['appPatch']
    public sendPresenceUpdate!: Baileys['sendPresenceUpdate']
    public presenceSubscribe!: Baileys['presenceSubscribe']
    public profilePictureUrl!: Baileys['profilePictureUrl']
    public onWhatsApp!: Baileys['onWhatsApp']
    public fetchBlocklist!: Baileys['fetchBlocklist']
    public fetchPrivacySettings!: Baileys['fetchPrivacySettings']
    public fetchStatus!: Baileys['fetchStatus']
    public updateProfilePicture!: Baileys['updateProfilePicture']
    public updateBlockStatus!: Baileys['updateBlockStatus']
    public resyncState!: Baileys['resyncState']
    public chatModify!: Baileys['chatModify']
    public processMessage!: Baileys['processMessage']
    public assertSession!: Baileys['assertSession']
    public relayMessage!: Baileys['relayMessage']
    public sendReadReceipt!: Baileys['sendReadReceipt']
    public refreshMediaConn!: Baileys['refreshMediaConn']
    public sendMessage!: Baileys['sendMessage']
    public groupMetadata!: Baileys['groupMetadata']
    public groupCreate!: Baileys['groupCreate']
    public groupLeave!: Baileys['groupLeave']
    public groupUpdateSubject!: Baileys['groupUpdateSubject']
    public groupParticipantsUpdate!: Baileys['groupParticipantsUpdate']
    public groupInviteCode!: Baileys['groupInviteCode']
    public groupToggleEphemeral!: Baileys['groupToggleEphemeral']
    public groupSettingUpdate!: Baileys['groupSettingUpdate']
    public ws: Baileys['ws']
    public ev: Baileys['ev']
    public authState!: Baileys['authState']
    public user!: Baileys['user']
    public assertingPreKeys!: Baileys['assertingPreKeys']
    public generateMessageTag!: Baileys['generateMessageTag']
    public query!: Baileys['query']
    public waitForMessage!: Baileys['waitForMessage']
    public waitForSocketOpen!: Baileys['waitForSocketOpen']
    public sendRawMessage!: Baileys['sendRawMessage']
    public sendNode!: Baileys['sendNode']
    public logout!: Baileys['logout']
    public end!: Baileys['end']
    public waitForConnectionUpdate!: Baileys['waitForConnectionUpdate']
    public groupFetchAllParticipating!: Baileys['groupFetchAllParticipating']
}
