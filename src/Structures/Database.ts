import { Connection } from 'mongoose'
import { UserModel, GroupModel, User, Group, connect, SessionModel, Session } from '../Database'

export default class Database {
    private readonly DB = {
        user: UserModel,
        group: GroupModel,
        session: SessionModel
    } as const

    public connection?: Connection

    constructor(public url: string) {}

    public connect = async (): Promise<void> => {
        this.connection = await connect(this.url)
    }

    public get connected(): boolean {
        return this.connection?.readyState === 1
    }

    public get Session(): typeof SessionModel {
        return this.DB.session
    }

    public get User(): typeof UserModel {
        return this.DB.user
    }

    public get Group(): typeof GroupModel {
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

    public addSession = async (sid: string, session: string): Promise<Session> => {
        return await new this.Session({ sid, session }).save()
    }

    public updateSession = async (sid: string, session: string): Promise<Session> => {
        const s = await this.getSession(sid)
        if (s) return await s.update({ session })
        return await this.addSession(sid, session)
    }

    public deleteSession = async (sid: string): Promise<Session | null> => {
        return await this.Session.findOneAndDelete({ sid })
    }
}
