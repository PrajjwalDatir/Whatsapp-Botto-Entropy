import { BaseCommand } from '../../Structures/Command/BaseCommand'
import { Command } from '../../Structures/Command/Command'
import Message from '../../Structures/Message'
import { IParsedArgs } from '../../typings/Command'

@Command('eval', {
    aliases: ['run'],
    category: 'Dev',
    description: {
        content: 'For Super Users.'
    }
})
export default class extends BaseCommand {
    override execute = async (M: Message, parsedArgs: IParsedArgs): Promise<void> => {
        if (!this.client.config.mods?.includes(M.sender.jid)) return void null
        let out: string
        try {
            const output = eval(parsedArgs.text) || 'Executed Javascript!'
            console.log(output)
            out = JSON.stringify(output)
        } catch (err : any) {
            out = err.message
        }
        return void (await M.reply(out))
    }
}
