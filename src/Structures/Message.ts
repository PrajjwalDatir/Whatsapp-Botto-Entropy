import { MessageOptions, MessageType, WAMessage } from '@adiwajshing/baileys'
import { GID, IUser, JID } from '../typings/Client'
import { isTruthy } from '../utils'
import Client from './Client'
import Group from './Group'

class Message {
    private supportedMediaMessages = [MessageType.image, MessageType.video]

    public content: string

    public group?: Group

    public mentioned = new Array<string>()

    public sender: IUser

    public readonly isAdminMessage = false

    constructor(private M: WAMessage, private client: Client) {
        this.sender = this.client.getContact(this.chat === 'dm' ? this.from : this.M.participant)
        if (M.message?.ephemeralMessage) this.M.message = M.message.ephemeralMessage.message
        const { type } = this
        this.content = ((): string => {
            if (this.M.message?.buttonsResponseMessage)
                return this.M.message?.buttonsResponseMessage?.selectedDisplayText || ''
            if (this.M.message?.listResponseMessage) return this.M.message?.listResponseMessage?.title || ''
            return type === MessageType.text && this.M.message?.conversation
                ? this.M.message.conversation
                : this.supportedMediaMessages.includes(type)
                ? this.supportedMediaMessages
                      .map((type) => this.M.message?.[type as MessageType.image | MessageType.video]?.caption)
                      .filter((caption) => caption)[0] || ''
                : type === MessageType.extendedText && this.M.message?.extendedTextMessage?.text
                ? this.M.message?.extendedTextMessage.text
                : ''
        })()
        const array =
            (M?.message?.[type as MessageType.extendedText]?.contextInfo?.mentionedJid
                ? M?.message[type as MessageType.extendedText]?.contextInfo?.mentionedJid
                : []) || []

        array.filter(isTruthy).forEach((jid) => this.mentioned.push(jid))
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
        type: MessageType = MessageType.text,
        options: MessageOptions = {}
    ): ReturnType<typeof this.client.sendMessage> => {
        options.quoted = this.M
        return this.client.sendMessage(this.from, content, type, options)
    }
}

export default Message
