import fs from "fs/promises"
import { PGlite } from "@electric-sql/pglite"

let pg: PGlite | null = null
export const init = async (): Promise<PGlite> => {
	const secret = process.env.POSTGRES
	pg = new PGlite(secret || './db/data')

	const INIT_FILE_PATH = process.env.INIT_FILE_PATH || './db/init/tables.sql'
	const INIT_QUERY = await fs.readFile(INIT_FILE_PATH, 'utf-8')
   	await pg.exec(INIT_QUERY)

    return pg
}

export default async (): Promise<PGlite> => {
    return pg || init()
};
