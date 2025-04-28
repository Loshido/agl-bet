import { createClient } from 'redis';

const secret = process.env.REDIS
if(!secret) throw new Error('REDIS introuvable')

const client = createClient({
    url: secret
}).on('error', err => console.error('[redis]', err))

if(!process.env.BUILDING) {
    client.connect()
}
export default client