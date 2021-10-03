import { getModelForClass, Prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

class SessionSchema {
    @Prop({
        type: String,
        required: true,
        unique: true
    })
    public sid?: string

    @Prop({
        type: String,
        required: true
    })
    public session?: string
}

export type Session = SessionSchema & Document

export const SessionModel = getModelForClass(SessionSchema)
