import mongoose from 'mongoose'

export const connect = async (url: string): Promise<mongoose.Connection> => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })

    return await new Promise<mongoose.Connection>((resolve, reject) => {
        mongoose.connection.on('error', (error) => {
            reject(error)
        })

        mongoose.connection.once('open', () => {
            resolve(mongoose.connection)
        })
    })
}
