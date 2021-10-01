import { WAGroupMetadata } from '@adiwajshing/baileys'

export interface IGroup {
    /** Group Title */
    title: string

    /** Group Metadata */
    metadata: WAGroupMetadata

    /** Group Participants */
    participants: string[]

    /** Group Admins */
    admins: string[]
}
