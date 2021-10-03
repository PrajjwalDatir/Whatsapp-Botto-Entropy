import { WAPresence } from '@adiwajshing/baileys'
import { BaseCommand } from '../../Structures/Command/BaseCommand'
import { Command } from '../../Structures/Command/Command'
import Message from '../../Structures/Message'
import { IParsedArgs } from '../../typings/Command'

@Command('set', {
    aliases: ['change'],
    category: 'Dev',
    mod : true,
    description: {
        content: 'You can change bot settings using this.'
    }
})
export default class extends BaseCommand {
    override execute = async (M: Message, parsedArgs: IParsedArgs): Promise<void> => {
        let out = 'done✅'
        try {
            const presenceArray = ['unavailable' , 'available' , 'composing' , 'recording' , 'paused']
            switch (parsedArgs.args[0]) {
                case 'prefix':
                    // check if the length is 1
                    if (parsedArgs.args[1].length !== 1) {
                        out = 'Prefix must be 1 character long.'
                        break
                    }
                    this.client.config.prefix = parsedArgs.args[1]
                    break
                case 'presence':
                    // find if args[1] is a valid presence
                    if (presenceArray.includes(parsedArgs.args[1])) {
                        this.client.sendPresenceUpdate(parsedArgs.args[1] as WAPresence)
                    } else {
                        out = 'invalid presence'
                    }
                    break
                case 'mods':
                    // check if args[1] is add or remove
                    if (parsedArgs.args[1] === 'add') {
                        // push the args[2] to the mods array
                        // if parsedArgs.args[2] doesn't contain '@s.whatsapp.net' add it at the end
                        parsedArgs.args[2] = parseInt(parsedArgs.args[2]).toString() + '@s.whatsapp.net'
                        this.client.config.mods.push(parsedArgs.args[2])
                    } else if (parsedArgs.args[1] === 'remove') {
                        // remove the args[2] from the mods array
                        if (parsedArgs.args[2] === '') {
                            this.client.config.mods.pop()
                        } else {
                        this.client.config.mods.splice(this.client.config.mods.indexOf(parsedArgs.args[2]), 1)
                        }
                    } else {
                        out = 'invalid args'
                    }
                    break
                default:
                    out = 'invalid setting'
                    break
            }
                    
            console.log(`args:${parsedArgs.args},\n flag:${parsedArgs.flags}, text:${parsedArgs.text}, command:${parsedArgs.command}, raw:${parsedArgs.raw}`)
            // this.client.sendPresenceUpdate('unavailable')
        } catch (err : any) {
            out = err.message
        }
        return void (await M.reply(out))
    }
}
