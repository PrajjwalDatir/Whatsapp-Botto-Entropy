import 'dotenv/config'
import { IClientConfig } from './typings/Client'

const getConfig = (): IClientConfig => {
    return {
        session: process.env.SESSION || 'entropy',
        prefix: process.env.PREFIX || '!',
        mods: process.env.MODS ? process.env.MODS.split(',') : []
    }
}

export default getConfig()
