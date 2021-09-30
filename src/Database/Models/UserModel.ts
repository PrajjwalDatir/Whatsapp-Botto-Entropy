import { getModelForClass, Prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

class UserSchema {
    @Prop({
        type: String,
        required: true,
        unique: true
    })
    public jid?: string

    @Prop({
        type: Boolean,
        default: false
    })
    public banned?: string
}

export type User = UserSchema & Document

export const UserModel = getModelForClass(UserSchema)
