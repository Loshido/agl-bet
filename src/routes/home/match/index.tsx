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
export const useMatchs = routeLoader$(async () => {
    const client = await pg();

    const response = await client.query<Match>(
        `SELECT * FROM matchs
        WHERE fermeture > now() AND ouverture < now()
        ORDER BY fermeture ASC`
    )
    
    client.release()

    return response.rows
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