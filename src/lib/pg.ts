import pg, { type PoolClient } from "pg";
const { Pool } = pg;

const secret = process.env.DB_PASSWORD
if(!secret) throw new Error('DB_PASSWORD introuvable')

let connections = 0
const pool = new Pool({
    host: '192.168.1.68',
    user: 'postgres',
    password: secret,
    max: 75,
    idleTimeoutMillis: 7000,
    connectionTimeoutMillis: 2000,
})

pool.on('acquire', () => {
    connections += 1;
    console.info(`[db] (${connections}) 👀 connection opened`)
})
pool.on('release', () => {
    connections -= 1;
    console.info(`[db] (${connections}) 👀 connection released`)
})

export default (): Promise<PoolClient> => pool.connect();