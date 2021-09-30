import express from 'express'
import { imageSync } from 'qr-image'
import Client from './Client'

export class Server {
    private app = express()

    constructor(private client: Client) {
        this.use('/', express.static('public'))
        this.use(
            '/wa',
            (req, res, next) => {
                const { session } = req.query
                console.log(session)
                if (typeof session !== 'string') return void res.status(400).json({ error: 'Invalid session' })
                if (session !== this.client.config.session)
                    return void res.status(403).json({ error: 'Invalid session' })
                next()
            },
            (() => {
                const router = express.Router()
                router.get('/qr', (_, res) => {
                    if (this.client.state === 'open') return void res.status(403).json({ error: 'Client already open' })
                    if (!this.client.qr)
                        return void res.status(500).json({ error: 'Failed to generate QR code. Try again' })
                    res.type('image/png')
                    res.send(imageSync(this.client.qr))
                })
                return router
            })()
        )
    }

    public use = this.app.use.bind(this.app)

    public get = this.app.get.bind(this.app)

    public post = this.app.post.bind(this.app)

    public listen = (...args: Parameters<typeof this.app.listen>): ReturnType<typeof this.app.listen> => {
        return this.app.listen(...args)
    }
}
