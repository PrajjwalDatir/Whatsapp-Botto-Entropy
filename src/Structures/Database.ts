import { Connection } from 'mongoose'
import { UserModel, GroupModel, User, Group, connect, SessionModel, Session } from '../Database'
import { ISession } from '../typings/Client'

export class Database {
    private readonly DB = {
        user: UserModel,
        group: GroupModel,
        session: SessionModel
    } as const

    public connection?: Connection

    public connect = async (url: string): Promise<void> => {
        this.connection = await connect(url)
    }

    get connected(): boolean {
        return this.connection?.readyState === 1
    }

    get Session(): typeof SessionModel {
        return this.DB.session
    }

    get User(): typeof UserModel {
        return this.DB.user
    }

    get Group(): typeof GroupModel {
        return this.DB.group
    }

    public getUser = async (jid: string, fields?: string): Promise<User> => {
        const user = await this.User.findOne({ jid }).select(fields)
        if (user) return user
        return await new this.DB.user({ jid }).save()
    }

    public getGroup = async (gid: string, fields?: string): Promise<Group> => {
        const group = await this.Group.findOne({ gid }).select(fields)
        if (group) return group
        return await new this.DB.group({ gid }).save()
    }

    public removeUser = async (jid: string): Promise<void> => {
        await this.User.deleteOne({ jid })
    }

    public removeGroup = async (gid: string): Promise<void> => {
        await this.Group.deleteOne({ gid })
    }

    public updateUser = async (jid: string, data: Partial<User>): Promise<User> => {
        const user = await this.getUser(jid)
        return await user.update(data)
    }

    public updateGroup = async (gid: string, data: Partial<Group>): Promise<Group> => {
        const group = await this.getGroup(gid)
        return await group.update(data)
    }

    public getAllUsers = async (fields?: string): Promise<User[]> => {
        return await this.User.find({}, fields)
    }

    public getAllGroups = async (fields?: string): Promise<Group[]> => {
        return await this.Group.find({}, fields)
    }

    public getSession = async (sid: string): Promise<Session | null> => {
        return await this.Session.findOne({ sid })
    }

    public getSessions = async (): Promise<Session[]> => {
        return await this.Session.find({})
    }

    public addSession = async (sid: string, session: ISession): Promise<Session> => {
        return await new this.Session({ sid, session }).save()
    }

    public updateSession = async (sid: string, session: ISession): Promise<Session> => {
        const data = await this.Session.findOneAndUpdate({ sid, session }, { $set: { updatedAt: new Date() } })
        if (data) return data
        return await this.addSession(sid, session)
    }

    public deleteSession = async (sid: string): Promise<Session | null> => {
        return await this.Session.findOneAndDelete({ sid })
    }
}
