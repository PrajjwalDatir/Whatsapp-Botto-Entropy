import { getModelForClass, Prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'
import { ISession } from '../../typings/Client'

class SessionSchema {
    @Prop({
        type: String,
        required: true,
        unique: true
    })
    public sid?: string

    @Prop({
        type: Object,
        required: true
    })
    public session?: ISession
}

export type Session = SessionSchema & Document

export const SessionModel = getModelForClass(SessionSchema)
