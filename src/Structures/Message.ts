import { MessageOptions, MessageType, WAMessage } from '@adiwajshing/baileys'
import { GID, JID } from '../typings/Client'
import Client from './Client'

class Message {
    private supportedMediaMessages = [MessageType.image, MessageType.video]

    constructor(private M: WAMessage, private client: Client) {
        if (M.message?.ephemeralMessage) this.M.message = M.message.ephemeralMessage.message
    }

    build = async (): Promise<this> => {
        return this
    }

    public content = ((): string => {
        if (this.M.message?.buttonsResponseMessage)
            return this.M.message?.buttonsResponseMessage?.selectedDisplayText || ''
        if (this.M.message?.listResponseMessage) return this.M.message?.listResponseMessage?.title || ''
        const { type } = this
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
        options?: MessageOptions
    ): ReturnType<typeof this.client.sendMessage> => {
        return this.client.sendMessage(this.from, content, type, options)
    }
}

export default Message
