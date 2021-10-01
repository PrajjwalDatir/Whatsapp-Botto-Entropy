import chalk from 'chalk'
import Client from '../Structures/Client'
import { BaseCommand } from '../Structures/Command/BaseCommand'
import Message from '../Structures/Message'
import { ICategories, IParsedArgs } from '../typings/Command'

export class MessageHandler {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly cooldowns = new Map<string, Map<string, any>>()
    public readonly commands = new Map<string, BaseCommand>()
    public readonly aliases = new Map<string, BaseCommand>()
    public readonly categories = new Array<ICategories>()

    constructor(private path: string, private client: Client) {}

    public execute = async (command: BaseCommand, M: Message, args: IParsedArgs): Promise<void> => {
        if (!this.cooldowns.has(command.id)) this.cooldowns.set(command.id, new Map())
        const now = Date.now()
        const timestamps = this.cooldowns.get(command.id)
        const cooldownAmount = (command.options.cooldown ?? 3) * 1000
        if (timestamps?.has(M.sender.jid)) {
            const expirationTime = (timestamps.get(M.sender.jid) || 0) + cooldownAmount
            if (now < expirationTime)
                return void M.reply(
                    `You need to wait ${(expirationTime - now) / 1000} seconds before using this command again.`
                )
            timestamps.set(M.sender.jid, now)
            setTimeout(() => timestamps.delete(M.sender.jid), cooldownAmount)
        } else timestamps?.set(M.sender.jid, now)
        try {
            await command.execute(M, args)
        } catch (error) {
            this.client.log((error as Error).message, true)
            console.log(error)
        }
    }

    public handle = async (M: Message): Promise<void> => {
        const inText = this.client.util.format('In: ', chalk.yellow(M.group?.title) || 'Direct Message')
        const args = this.parseArgs(M.content)
        if (!args.command) return
        if (!args.command.startsWith(this.client.config.prefix))
            return this.client.log(`Message From: `, chalk.yellow(M.sender.username), inText)
        args.command = args.command.slice(this.client.config.prefix.length)
        this.client.log(`Command From`, chalk.yellow(M.sender.username), inText)
        const command = this.commands.get(args.command) || this.aliases.get(args.command)
        if (!command) return void M.reply(`Command \`${args.command}\` not found.`)
        if (command.options.group && !M.group) return void M.reply(`Command \`${command.id}\` is a group command.`)
        if (command.options.group && command.options.admin && !M.isAdminMessage)
            return void M.reply(`Command \`${command.id}\` is a group command and requires admin permissions.`)
        if (command.options.mod && M.sender.isMod) return void M.reply(`Command \`${command.id}\` is a mod command.`)
        this.execute(command, M, args)
    }
    private parseArgs = (raw: string): IParsedArgs => {
        const args = raw.split(' ')
        const command = args.shift()?.toLocaleLowerCase() || ''
        const text = args.join(' ')
        const flags: Record<string, string> = {}
        for (const arg of args) {
            if (arg.startsWith('--')) {
                const [key, value] = arg.slice(2).split('=')
                flags[key] = value
            } else if (arg.startsWith('-')) {
                flags[arg] = ''
            }
        }
        return {
            command,
            text,
            flags,
            args,
            raw
        }
    }

    public loadCommands = (): void => {
        this.client.log(chalk.green('Loading Commands...'))
        const loaded = []
        const files = this.client.util.readdirRecursive(this.path)
        for (const file of files) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const load = require(file).default
            if (!load || !(load.prototype instanceof BaseCommand)) continue
            const command = this.getCommand(file)
            loaded.push(command.id)
            this.registry(command)
            this.client.log(`Loaded: ${chalk.green(command.id)} from ${chalk.green(file)}`)
        }
        this.client.log(`Successfully Loaded ${chalk.greenBright(this.commands.size)} Commands`)
    }

    public registry(command: string | BaseCommand): void {
        if (typeof command === 'string') command = this.getCommand(command)
        this.addToCategory(command)
        this.commands.set(command.id, command)
    }

    public getCommand(path: string): BaseCommand {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command: BaseCommand = new (require(path).default)(this.client)
        command.client = this.client
        command.path = path
        command.handler = this
        return command
    }

    public addToCategory(command: BaseCommand): void {
        const category: ICategories = this.categories.find((x) => x.name === command.options.category) ?? {
            name: command.options.category || 'Uncategorized',
            commands: []
        }
        if (!category.commands.some((x) => x.id === command.id)) category.commands.push(command)
        if (!this.categories.some((x) => x.name === command.options.category)) this.categories.push(category)
    }
}
