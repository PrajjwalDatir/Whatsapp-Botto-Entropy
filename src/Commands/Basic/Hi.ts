import { BaseCommand } from '../../Structures/Command/BaseCommand'
import { Command } from '../../Structures/Command/Command'
import Message from '../../Structures/Message'
import { IParsedArgs } from '../../typings/Command'

@Command('hi', {
    aliases: ['hello'],
    category: 'Basic',
    description: {
        content: 'Say hello to the bot.'
    }
})
export default class extends BaseCommand {
    override execute = async (M: Message, args: IParsedArgs): Promise<void> => {
        console.log(M, args)
        await M.reply('Hello Child 👽')
    }
}
