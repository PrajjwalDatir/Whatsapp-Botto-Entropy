import { GroupMetadata } from '@adiwajshing/baileys'

export interface IGroup {
    /** Group Title */
    title: string

    /** Group Metadata */
    metadata: GroupMetadata

    /** Group Participants */
    participants: string[]

    /** Group Admins */
    admins: string[]
}
