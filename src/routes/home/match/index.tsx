import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Affiche from "~/components/equipes/affiche";

export interface Match {
    id: number,
    titre: string,
    informations: string,
    ouverture: Date,
    fermeture: Date,
    participants: number,
    agl: number,
    equipes: string[]
}

import pg from "~/lib/pg";
import cache from "~/lib/cache";
import redis from "~/lib/redis";
export const useMatchs = routeLoader$(async () => {
    return await cache<Match[]>(async () => {
        const rd = await redis()

        const matchs = await rd.hVals('matchs')
        await rd.disconnect()
        
        if(matchs.length === 0) {
            return ['no', async matchs => {
                const rd = await redis()
                matchs.forEach(async match => {
                    await rd.hSet('matchs', match.id, JSON.stringify(match))
                })
                await rd.disconnect()
            }]
        }
        return ['ok', matchs
            .map(match => JSON.parse(match)) as Match[]]
    }, async () => {
        const client = await pg();
    
        const response = await client.query<Match>(
            `SELECT * FROM matchs
            WHERE fermeture > now() AND ouverture < now()
            ORDER BY fermeture ASC`
        )
        
        client.release()
    
        return response.rows
    })
})

export default component$(() => {
    const matchs = useMatchs()

    return <>
        {
            matchs.value.map(match => 
                <Affiche
                    key={match.id}
                    match={match}/>)
        }
    </>
})