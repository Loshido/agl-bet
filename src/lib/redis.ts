import { createClient } from 'redis';

const secret = process.env.REDIS
if(!secret) throw new Error('REDIS introuvable')

export default async () => {
    const client = createClient({
        url: secret
    }).on('error', err => console.error('[redis]', err))

    await client.connect()
    return client
}