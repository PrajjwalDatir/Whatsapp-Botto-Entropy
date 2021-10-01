import Client from '../Structures/Client'
import Message from '../Structures/Message'

export interface IParsedArgs {
    args: string[]
    flags: Record<string, string>
    text: string
    raw: string
}

export interface ICommand {
    id: string
    client: Client
    options: ICommandOptions
    execute: (message: Message, parsedArgs: IParsedArgs) => void | never | Promise<void> | Promise<never>
}

export interface ICommandOptions {
    cooldown?: number
    aliases: string[]
    category: string
    description: ICommandDescription
    mod?: boolean
    admin?: boolean
    group?: boolean
}

export interface ICommandDescription {
    content: string
    usage?: string
}

export interface ICategories {
    name: string
    path?: string
    commands: ICommand[]
}
