import { component$ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import Button from "~/components/admin/button";

interface Retrait {
    id: number,
    pseudo: string,
    agl: number,
    at: Date
}

import pg from "~/lib/pg";
export const useRetraits = routeLoader$(async () => {
    const client = await pg()

    const response = await client.query<Retrait>(
        `SELECT id, pseudo, agl, at FROM retraits
        WHERE effectif = false
        ORDER BY at DESC`
    )

    client.release()

    return response.rows
})

const actionRetrait = server$(async (id: number) => {
    const client = await pg()

    await client.query<Retrait>(
        `UPDATE retraits SET effectif = true WHERE id = $1`,
        [id]
    )

    client.release()
})

export default component$(() => {
    const retraits = useRetraits()
    return <>
        <h1 class="font-bold text-2xl my-4">
            Confirmation des retraits
        </h1>
        {
            retraits.value.length === 0 && <p>
                👀 Il n'y a pas de retraits en attente...
            </p>
        }
        {
            retraits.value.map((retrait, i) => <div key={i}
                class="grid grid-cols-3 gap-2 *:transition-colors items-center">
                <p class="font-bold">
                    { retrait.pseudo }
                    <span class="font-light text-xs mx-2">
                        { retrait.at.toLocaleTimeString(undefined, { timeStyle: 'short' }) }
                    </span>
                </p>
                <p class="text-right font-sobi text-sm">
                    { retrait.agl }
                    <span class="mx-2 text-pink text-xs">
                        agl
                    </span>
                </p>
                <Button onClick$={async () => {
                    const confirmation = prompt(`Entrez 'oui' pour confirmer`)
                    if(confirmation === 'oui') await actionRetrait(retrait.id)
                }}>
                    Effectué
                </Button>
            </div>)
        }
    </>
})