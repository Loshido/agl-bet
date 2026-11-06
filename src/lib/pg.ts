import fs from "fs/promises"
import { PGlite } from "@electric-sql/pglite"

let pg: PGlite | null = null
export const init = async (): Promise<PGlite> => {
	const secret = process.env.POSTGRES
	pg = new PGlite(secret || './db/data')

	const INIT_QUERY = await fs.readFile('./db/init/1. tables.sql', 'utf-8')
   	pg.exec(INIT_QUERY)

    return pg
}

export default async (): Promise<PGlite> => {
    return pg || init()
};
