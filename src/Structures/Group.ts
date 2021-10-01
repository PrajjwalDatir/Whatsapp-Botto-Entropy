import { WAGroupMetadata } from '@adiwajshing/baileys'
import { GID } from '../typings/Client'
import { IGroup } from '../typings/Message'
import Client from './Client'

export default class Group implements IGroup {
    title = ''

    participants = new Array<string>()

    admins = new Array<string>()

    constructor(private gid: GID | string, public client: Client) {}

    build = async (): Promise<this> => {
        this.metadata = await this.client.groupMetadata(this.gid)
        this.title = this.metadata.subject
        for (const { jid, isAdmin } of this.metadata.participants) {
            if (isAdmin) this.admins.push(jid)
            this.participants.push(jid)
        }
        return this
    }

    metadata!: WAGroupMetadata
}
