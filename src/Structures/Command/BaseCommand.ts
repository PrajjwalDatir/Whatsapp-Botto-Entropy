import { ICommand, ICommandOptions, IParsedArgs } from '../../typings/Command'
import type Client from '../Client'
import Message from '../Message'

export class BaseCommand implements ICommand {
    public path = __filename

    constructor(public client: Client, public id: string, public options: ICommandOptions) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public execute = async (_message: Message, _args: IParsedArgs): Promise<void> => {
        throw new Error('Method not implemented.')
    }
}

export type CommandParams = ConstructorParameters<typeof BaseCommand>
