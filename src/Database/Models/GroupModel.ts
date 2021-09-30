import { getModelForClass, Prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

class GroupSchema {
    @Prop({
        type: String,
        required: true,
        unique: true
    })
    public gid?: string
}

export type Group = GroupSchema & Document

export const GroupModel = getModelForClass(GroupSchema)
