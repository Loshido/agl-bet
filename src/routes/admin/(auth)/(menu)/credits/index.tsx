import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import Button from "~/components/admin/button";
import Dialog from "~/components/Dialog";
import pg from "~/lib/pg";

interface Credit {
    id: number,
    pseudo: string,
    at: string,
    interets: number,
    apport: number,
    credit: number,
    du: number
}

export const useCredits = routeLoader$(async ctx => {

    const client = await pg()

    const response = await client.query<Credit>(
        `SELECT id, pseudo, at, interets, apport, credit, du
        FROM credits
        WHERE status = 'en attente'`
    )

    client.release()

    return response.rows
})

interface LigneCredit {
    id: number,
    pseudo: string,
    at: Date,
    interets: number,
    apport: number,
    credit: number,
    du: number,
    status: string
}

import { credits as creditsCache } from "~/lib/cache";
const actionCredit = server$(async (id: number, action: 'refuser' | 'accepter') => {
    const client = await pg();

    if(action === 'refuser') {
        const data = await client.query<LigneCredit>(
            `DELETE FROM credits WHERE id = $1 RETURNING *`, 
            [id]
        )
        if(data.rowCount) {
            const credit = data.rows[0]
            await client.query(`
                UPDATE utilisateurs SET agl = agl + $2
                WHERE pseudo = $1`,
                [credit.pseudo, credit.apport]
            )
            await client.query(`
                INSERT INTO transactions (pseudo, agl, raison)
                VALUES ($1, $2, $3)`,
                [credit.pseudo, credit.apport, "Crédit refusé"]
            )
        } 
    } else {
        try {
            await client.query('BEGIN')
            const response = await client.query<LigneCredit>(
                `SELECT * FROM credits WHERE id = $1`, 
                [id]
            )
            if(!response.rowCount) {
                throw new Error('Crédit introuvable')
            }

            const credit = response.rows[0]
            console.log(credit)
            await client.query(
                `UPDATE credits
                SET status = 'remboursement'
                WHERE id = $1`,
                [id]
            )
            await client.query(
                `UPDATE utilisateurs
                SET agl = agl + $2
                WHERE pseudo = $1`,
                [credit.pseudo, credit.credit]
            )
            await client.query(
                `INSERT INTO transactions (pseudo, agl, raison)
                VALUES ($1, $2, $3)`,
                [credit.pseudo, credit.credit, "Crédit accepté"]
            )

            await client.query('COMMIT')
            await creditsCache.removeItem(credit.pseudo)
        } catch(e) {
            await client.query('ROLLBACK')
        }
    }
    
    client.release()
}) 

export default component$(() => {
    const credits = useCredits()
    const action = useSignal<null | number>(null)
    return <div class="flex flex-col gap-4">
        <h1 class="font-bold text-2xl my-4">
            Validation des crédits
        </h1>
        {
            credits.value.length === 0 && <p>
                👀 Il n'y a pas de crédits en attente...
            </p>
        }
        {
            credits.value.map((credit, i) => <div key={i}
                class="grid grid-cols-3">
                <div class="text-sm col-span-2">
                    { credit.pseudo } demande <span class="font-sobi">
                        { credit.credit } <span 
                            class="text-xs text-pink">agl </span>
                    </span>
                    à { Math.round(credit.interets * 100) }%,<br/>
                    Il devra <span class="font-sobi">
                        { credit.credit } <span class="text-xs text-pink">
                            agl
                        </span>
                    </span>
                </div>
                <Button class="h-fit" onClick$={() => action.value = credit.id}>
                    Intéragir
                </Button>
            </div>)
        }
        <Dialog open={action.value !== null} exit={$(() => action.value = null)}
            class="text-white">
            <Button onClick$={async () => {
                await actionCredit(action.value!, 'accepter')
                action.value = null
            }}>
                Accepter
            </Button>
            <Button onClick$={async () => {
                await actionCredit(action.value!, 'refuser')
                action.value = null
            }}>
                Refuser
            </Button>
        </Dialog>
    </div>
})