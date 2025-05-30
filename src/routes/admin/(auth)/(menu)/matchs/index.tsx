import { $, component$, useSignal } from "@builder.io/qwik";
import { Link, routeLoader$, server$ } from "@builder.io/qwik-city";
import Dialog from "~/components/Dialog";
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

import redis from "~/lib/redis"
type Action = { type: 'supprimer' } | 
    { type: 'allonger', temps: number } |
    { type: 'fermer' }
export const actionMatch = server$(async (id: number, action: Action) => {
    const client = await pg();

    switch(action.type) {
        case 'allonger':
            if(typeof action.temps !== 'number') {
                break
            }
            await client.query(
                `UPDATE matchs SET fermeture = fermeture + INTERVAL '${action.temps} minutes'
                WHERE id = $1`,
                [id]
            )
            break
        case 'supprimer':
            try {
                await client.query('BEGIN')
                const paris = await client.query<{ pseudo: string, agl: number }>(
                    `DELETE FROM paris WHERE match = $1
                    RETURNING pseudo, agl`,
                    [id]
                )

                for(const { pseudo, agl } of paris.rows) {
                    await client.query(
                        `UPDATE utilisateurs SET agl = agl + $2
                        WHERE pseudo = $1`,
                        [pseudo, agl]
                    )
                    await client.query(
                        `INSERT INTO transactions (pseudo, agl, raison)
                        VALUES ($1, $2, $3)`,
                        [pseudo, agl, `Annulation du pari (${id}).`]
                    )
                    await redis.hDel('payload', pseudo)
                }

                await client.query(
                    `DELETE FROM matchs
                    WHERE id = $1`,
                    [id]
                )
                await client.query('COMMIT')
            } catch(e) {
                await client.query('ROLLBACK')
                client.release()
            }
            break
        case 'fermer':
            await client.query(
                `UPDATE matchs SET fermeture = now()
                WHERE id = $1`,
                [id]
            )
            await redis.hDel('matchs', id.toString())
            break
    }

    client.release()
})

export default component$(() => {
    const matchs = useMatchs()
    const selection = useSignal<null | number>(null)
    return <>
        <Link href="/admin/matchs/new" 
            class="px-2 py-1 sm:px-3 rounded-md flex flex-row items-center gap-2
            transition-colors bg-white/25 hover:bg-white/50 w-fit font-avenir">
            Créer un nouveau match
        </Link>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {
                matchs.value.map(match => <div key={match.id} 
                    class="flex flex-col sm:grid p-3 rounded-md grid-cols-3 justify-between gap-2
                    sm:items-center bg-white/25">
                    <div class="flex flex-col gap-2 col-span-2">
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
                    </div>
                    <div class="w-full h-full flex flex-row justify-end items-start">
                        { 
                            match.fermeture.getTime() < Date.now()
                            ? <Link 
                                href={`/admin/matchs/${match.id}`}
                                class="px-2 py-1 bg-white/25 rounded-md
                                transition-colors hover:bg-pink/75">
                                Entrer résultats
                            </Link>
                            : <div class="px-2 py-1 bg-white/25 rounded-md
                                transition-colors hover:bg-pink/75
                                cursor-pointer select-none"
                                onClick$={() => selection.value = match.id}>
                                Intéragir
                            </div>
                        }
                    </div>
                </div>)
            }
        </div>
        <Dialog open={ selection.value !== null }
            exit={$(() => selection.value = null)}
            class="text-white">
            <div class="px-2 py-1 bg-white/25 rounded-md
                transition-colors hover:bg-pink/75
                cursor-pointer select-none"
                onClick$={async () => {
                    const confirmation = prompt(
                        `Entrez 'oui' pour supprimer le match N°${selection.value}`
                    );
                    if(confirmation === 'oui' && selection.value) {
                        await actionMatch(selection.value, {
                            type: "supprimer"
                        })
                        selection.value = null
                    }
                }}>
                Supprimer
            </div>
            <div class="px-2 py-1 bg-white/25 rounded-md
                transition-colors hover:bg-pink/75
                cursor-pointer select-none"
                onClick$={async () => {
                    const qt = prompt(
                        `Entrez la quantité de minutes que vous voulez ajouter`
                    )
                    const min = parseInt(qt || '-1')
                    if(min > 0 && selection.value) {
                        await actionMatch(selection.value, {
                            type: 'allonger',
                            temps: min
                        })
                        selection.value = null
                    }
                }}>
                Rallonger
            </div>
            <div class="px-2 py-1 bg-white/25 rounded-md
                transition-colors hover:bg-pink/75
                cursor-pointer select-none"
                onClick$={async () => {
                    const confirmation = prompt(
                        `Entrez 'oui' pour fermer les paris du match`
                    )
                    if(confirmation === 'oui' && selection.value) {
                        await actionMatch(selection.value, {
                            type: 'fermer',
                        })
                        selection.value = null
                    }
                }}>
                Fermer
            </div>
        </Dialog>
    </>
})