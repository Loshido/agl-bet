import { Equipes, Match } from "./types";

import { matchs as matchs_cache, type FullMatch } from "./cache"
import pg from "./pg";


type RawMatch = Match

export const matchs = async (): Promise<FullMatch[]> => {
    const data: FullMatch[] = [];
    const keys = await matchs_cache.keys()
    if(keys.length > 0) {
        for(const key of keys) {
            const value = await matchs_cache.getItem(key)
            if(!value) continue;
            data.push(value)
        }
        return data;
    }
    
    const client = await pg()
    const response = await client.query<RawMatch>(
        `SELECT m.*, array_agg(o.equipe) AS equipes FROM matches m
            LEFT JOIN matches_opposants o ON m.id = o.match 
            GROUP BY m.id`
    );
    const equipes = await client.query<Equipes>(
        `SELECT e.*, array_agg(m.pseudo) as membres FROM equipes e
        LEFT JOIN equipes_membres m ON m.equipe = e.nom
        GROUP BY e.nom`
    )
    client.release()
    
    if(!response.rowCount || !equipes.rowCount) return data
    response.rows.forEach(async row => {

        const value: FullMatch = {
            ...row,
            equipes: row.equipes
                .map(local_equipe => equipes.rows
                    .find(equipe => local_equipe === equipe.nom))
                .filter(equipe => !!equipe)
        }
        data.push(value);
        await matchs_cache.setItem(row.id, value)
    })
    return data;
}