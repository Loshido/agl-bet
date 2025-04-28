import { createClient } from 'redis';

const secret = process.env.REDIS
if(!secret) throw new Error('REDIS introuvable')

const client = createClient({
    url: secret
}).on('error', err => console.error('[redis]', err))

client.connect()
export default client