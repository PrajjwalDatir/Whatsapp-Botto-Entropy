import { AnyMessageContent, MessageType, WAMessage, MiscMessageGenerationOptions } from '@adiwajshing/baileys'
import { GID, IUser, JID } from '../typings/Client'
import Client from './Client'
import Group from './Group'

class Message {
    public supportedMediaMessages = new Array<MessageType>('imageMessage', 'videoMessage')

    public content: string

    public group?: Group

    public mentioned = new Array<string>()

    public sender: IUser

    public readonly isAdminMessage = false

    constructor(private M: WAMessage, private client: Client) {
        this.sender = this.client.getContact(this.chat === 'dm' ? this.from : (this.M.key.participant as string))
        if (M.pushName) this.sender.username = M.pushName
        if (M.message?.ephemeralMessage) this.M.message = M.message.ephemeralMessage.message
        const { type } = this
        this.content = ((): string => {
            if (this.M.message?.buttonsResponseMessage)
                return this.M.message?.buttonsResponseMessage?.selectedDisplayText || ''
            if (this.M.message?.listResponseMessage) return this.M.message?.listResponseMessage?.title || ''
            return this.M.message?.conversation
                ? this.M.message.conversation
                : this.supportedMediaMessages.includes(type)
                ? this.supportedMediaMessages
                      .map((type) => this.M.message?.[type as 'imageMessage' | 'videoMessage']?.caption)
                      .filter((caption) => caption)[0] || ''
                : this.M.message?.extendedTextMessage?.text
                ? this.M.message?.extendedTextMessage.text
                : ''
        })()
        const array =
            (M?.message?.[type as 'extendedTextMessage']?.contextInfo?.mentionedJid
                ? M?.message[type as 'extendedTextMessage']?.contextInfo?.mentionedJid
                : []) || []

        array.filter(this.client.util.isTruthy).forEach((jid) => this.mentioned.push(jid))
    }

    public build = async (): Promise<this> => {
        if (this.chat === 'dm') return this
        this.group = await new Group(this.from, this.client).build()
        return this
    }

    get chat(): 'group' | 'dm' {
        return this.from.endsWith('g.us') ? 'group' : 'dm'
    }

    get from(): JID | GID | string {
        return this.M.key.remoteJid as string
    }

    get type(): MessageType {
        return Object.keys(this.M.message || 0)[0] as MessageType
    }

    public reply = async (
        content: string | Buffer,
        type: 'text' | 'image' | 'audio' | 'video' = 'text',
        options: MiscMessageGenerationOptions = {}
    ): ReturnType<typeof this.client.sendMessage> => {
        options.quoted = this.M
        if (type === 'text' && Buffer.isBuffer(content)) throw new Error('Cannot send a Buffer as a text message')
        return this.client.sendMessage(
            this.from,
            {
                [type]: content
            } as unknown as AnyMessageContent,
            options
        )
    }
}

export default Message
