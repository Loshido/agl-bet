import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null
export const setup = () => {
    const secret = process.env.POSTGRES
    if(!secret) throw new Error('variable POSTGRES introuvable')
    
    pool = new Pool({
        connectionString: secret,
        max: 20,
        idleTimeoutMillis: 7000,
        connectionTimeoutMillis: 2000,
    })
    
    if(process.env.DEV) {
        setInterval(() => {
            console.log(`[db] ${pool?.totalCount } active connections`)
        }, 1000 * 60 * 60);
    }

    return pool
}

export default (): Promise<PoolClient> => {
    if(!pool) return setup().connect()
    return pool.connect()
};