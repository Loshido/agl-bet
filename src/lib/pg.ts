import pg, { type PoolClient } from "pg";
const { Pool } = pg;

const secret = process.env.POSTGRES
if(!secret) throw new Error('POSTGRES introuvable')

let connections = 0
const pool = new Pool({
    connectionString: secret,
    max: 20,
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