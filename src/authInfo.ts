/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { BufferJSON } from '@adiwajshing/baileys'
import { existsSync } from 'fs'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import Database from './Structures/Database'

export const getAuthInfo = async (database: Database, sid: string): Promise<any> => {
    const filename = join('.', sid.concat('_SESSION.json'))
    if (existsSync(filename)) {
        const raw = await readFile(filename, { encoding: 'utf8' })
        const data = JSON.parse(raw, BufferJSON.reviver)
        await database.updateSession(sid, raw)
        return data
    }
    const { session } = (await database.getSession(sid)) || {}
    if (!session) return undefined
    await writeFile(filename, JSON.stringify(session))
    return session
}

export const saveAuthInfo = async (database: Database, sid: string, session: any): Promise<void> => {
    const filename = join('.', sid.concat('_SESSION.json'))
    const data = JSON.stringify(session, BufferJSON.replacer)
    await writeFile(filename, data)
    await database.updateSession(sid, data)
}
