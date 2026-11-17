import { $, component$, useSignal, useStore } from "@builder.io/qwik";
import { Link, routeLoader$, server$ } from "@builder.io/qwik-city";
import Dialog from "~/components/Dialog";
import pg from "~/lib/pg";

interface Match {
    id: number,
    titre: string,
    informations: string,
    phase: 'en attente' | 'ouvert' | 'fermé',
}

export const useMatchs = routeLoader$(async () => {
    const client = await pg()

    const response = await client.query<Match>(
        `SELECT id, titre, informations, phase
        FROM matchs
        WHERE statut = 'en attente'`
    )

    return response.rows
})

type Action = { type: 'supprimer' } |
    { type: 'ouvrir' } |
    { type: 'fermer' }
export const actionMatch = server$(async (id: number, action: Action) => {
    const client = await pg();

    if(action.type === "ouvrir") {
        const response = await client.query(
            `UPDATE matchs SET phase = 'ouvert'
            WHERE id = $1 AND phase = 'en attente'
            RETURNING id`,
            [id]
        )
        return response.rowCount === 1
    }
    if(action.type === "supprimer") {
        try {
            await client.query('BEGIN')
            const paris = await client.query<{ pseudo: string, agl: number }>(
                `DELETE FROM paris WHERE match = $1
                RETURNING pseudo, agl`,
                [id]
            )

            for(const { pseudo, agl } of paris.rows) {
                await Promise.all([
                    client.query(
                        `UPDATE utilisateurs SET agl = agl + $2
                        WHERE pseudo = $1`,
                        [pseudo, agl]
                    ),
                    client.query(
                        `INSERT INTO transactions (pseudo, agl, raison)
                        VALUES ($1, $2, $3)`,
                        [pseudo, agl, `Annulation du pari (${id}).`]
                    )
                ])
            }

            await client.query(
                `DELETE FROM matchs
                WHERE id = $1`,
                [id]
            )
            await client.query('COMMIT')
            return true
        } catch(e) {
            await client.query('ROLLBACK')
                return false
        }
    }
    if(action.type === "fermer") {
        const response = await client.query(
            `UPDATE matchs SET phase = 'fermé'
            WHERE id = $1 AND phase = 'ouvert'
            RETURNING id`,
            [id]
        )
        return response.rowCount === 1
    }
    return false
})

export default component$(() => {
    const signal = useMatchs()
    const matchs = useStore(signal.value)
    const selection = useSignal<null | number>(null)
    const selected = matchs.find(m => m.id === selection.value)
    return <>
        <Link href="/admin/matchs/new"
            class="px-2 py-1 sm:px-3 rounded-md flex flex-row items-center gap-2
            transition-colors bg-white/25 hover:bg-white/50 w-fit font-avenir">
            Créer un nouveau match
        </Link>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {
                matchs.map(match => <div key={match.id}
                    class="flex flex-col sm:grid p-3 rounded-md grid-cols-3 justify-between gap-2
                    sm:items-center bg-white/25">
                    <div class="flex flex-col gap-2 col-span-2">
                        <h2 class="font-sobi text-2xl">
                            { match.titre }
                        </h2>
                        <p class="text-white/75 text-wrap">
                            { match.informations }
                            <span class="text-white/75 text-xs italic"
                                title="Statut du paris"> - {
                                match.phase
                            }</span>
                        </p>
                    </div>
                    <div class="w-full h-full flex flex-row justify-end items-start">
                        {
                            match.phase === 'fermé'
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
            {
                selected?.phase === 'en attente' && <div class="px-2 py-1 bg-white/25 rounded-md
                    transition-colors hover:bg-pink/75
                    cursor-pointer select-none"
                    onClick$={async () => {
                        const id = selection.value
                        if(!id) return
                        const reussite = await actionMatch(id, { type: 'ouvrir' })
                        if(!reussite) return
                        const match = matchs.find(m => m.id === id)
                        if(match) match.phase = 'ouvert'
                        selection.value = null
                    }}>
                    Ouvrir les paris
                </div>
            }
            {
                selected?.phase === 'ouvert' && <div class="px-2 py-1 bg-white/25 rounded-md
                    transition-colors hover:bg-pink/75
                    cursor-pointer select-none"
                    onClick$={async () => {
                        const id = selection.value
                        if(!id) return
                        if(!confirm(`Fermer les paris du match N°${id} ?`)) return
                        const reussite = await actionMatch(id, { type: 'fermer' })
                        if(!reussite) return
                        const match = matchs.find(m => m.id === id)
                        if(match) match.phase = 'fermé'
                        selection.value = null
                    }}>
                    Fermer les paris
                </div>
            }
            <div class="px-2 py-1 bg-white/25 rounded-md
                transition-colors hover:bg-pink/75
                cursor-pointer select-none"
                onClick$={async () => {
                    const confirmation = prompt(
                        `Entrez 'oui' pour supprimer le match N°${selection.value}`
                    );
                    if(confirmation === 'oui' && selection.value) {
                        const reussite = await actionMatch(selection.value, {
                            type: "supprimer"
                        })
                        if(reussite) {
                            const i = matchs.findIndex(m => m.id === selection.value)
                            matchs.splice(i, 1)
                            selection.value = null
                        }
                    }
                }}>
                Supprimer
            </div>
        </Dialog>
    </>
})
