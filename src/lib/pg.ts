import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null
export const setup = () => {
    const secret = process.env.POSTGRES
    if(!secret) throw new Error('variable POSTGRES introuvable')
    
    let connections = 0
    pool = new Pool({
        connectionString: secret,
        max: 20,
        idleTimeoutMillis: 7000,
        connectionTimeoutMillis: 2000,
    })
    
    if(!process.env.BUILDING) {
        setInterval(() => {
            console.log(`[db] ${connections} active connections`)
        }, 1000 * 60 * 60);
    }
    
    pool.on('acquire', () => connections += 1)
    pool.on('release', () => connections -= 1)

    return pool
}


export default (): Promise<PoolClient> => {
    if(!pool) return setup().connect()
    return pool.connect()
};