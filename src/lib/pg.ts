import pg, { type PoolClient } from "pg";
const { Pool } = pg;

const secret = process.env.POSTGRES
if(!secret) throw new Error('POSTGRES introuvable')

let connections = 0
let count = 0;
const pool = new Pool({
    connectionString: secret,
    max: 20,
    idleTimeoutMillis: 7000,
    connectionTimeoutMillis: 2000,
})

setInterval(() => {
    console.log(`[db] ${count} connections opened since last check`)
    console.log(`[db] ${connections} active connections`)
}, 1000 * 60 * 60 * 4);

pool.on('acquire', () => {
    connections += 1;
    count += 1
})
pool.on('release', () => {
    connections -= 1;
})

export default (): Promise<PoolClient> => pool.connect();