import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import pg from "~/lib/pg";

interface Match {
    id: number,
    titre: string,
    ouverture: Date,
    fermeture: Date,
    informations: string,
}

export const useMatchs = routeLoader$(async () => {
    const client = await pg()
    
    const response = await client.query<Match>(
        `SELECT id, titre, informations, ouverture, fermeture
        FROM matchs
        WHERE statut = 'en attente'`
    )

    client.release()
    
    return response.rows
})

export default component$(() => {
    const matchs = useMatchs()
    return <>
        <Link href="/admin/matchs/new" 
            class="px-2 py-1 sm:px-3 rounded-md flex flex-row items-center gap-2
            transition-colors bg-white/25 hover:bg-white/50 w-fit font-avenir">
            Créer un nouveau match
        </Link>
        {
            matchs.value.map(match => <div key={match.id} 
                class="px-4 py-2 rounded-md flex flex-col gap-2
                transition-colors bg-white/25">
                <h2 class="font-sobi text-2xl">
                    { match.titre }
                </h2>
                <p class="text-white/75 text-wrap">
                    { match.informations }
                    <span class="text-white/75 text-xs italic"
                        title="Période d'ouverture des paris"> - { 
                        match.ouverture.toLocaleTimeString(undefined, {
                            timeStyle: 'short'
                        }) } - { 
                        match.fermeture.toLocaleTimeString(undefined, {
                            timeStyle: 'short'
                        })
                    }</span>
                </p>
            </div>)
        }
    </>
})