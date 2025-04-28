import { createClient } from 'redis';

const secret = process.env.REDIS
if(!secret) throw new Error('REDIS introuvable')

let debounce = 0
const client = createClient({
    url: secret
})
    .on('error', async err => {
        console.error('[redis]', err)
        if(!client.isOpen && debounce + 1000 < Date.now()) {
            debounce = Date.now()
            console.info('[redis] reconnecting manually...')
            await client.connect()
        }
    })

if(!process.env.BUILDING) {
    client.connect()
}
export default client