import { component$ } from "@builder.io/qwik";
import { DocumentHead, routeLoader$, useLocation } from "@builder.io/qwik-city";

interface Transaction {
    agl: number,
    raison: string,
    at: Date
}

import pg from "~/lib/pg";
export const useTransaction = routeLoader$(async ctx => {
    const pseudo = ctx.params.pseudo;

    const client = await pg();

    const response = await client.query<Transaction>(
        `SELECT agl, raison, at FROM transactions
        WHERE pseudo = $1
        ORDER BY at DESC`,
        [pseudo]
    )

    client.release()

    return response.rows
})

export default component$(() => {
    const loc = useLocation()
    const transactions = useTransaction()
    return <>
        <h1 class="font-bold text-2xl my-4">
            Transactions de {loc.params.pseudo}
        </h1>
        {
            transactions.value.map((tr, i) => <div key={i}
                class="grid grid-cols-7 gap-1 items-center">
                <div class="text-center text-xs">
                    { tr.at.toLocaleTimeString(undefined, { timeStyle: 'short' }) }
                </div>
                <div class="font-sobi text-center text-xs col-span-2">
                    { tr.agl } <span class="text-pink text-xs">agl</span>
                </div>
                <div class="col-span-4">
                    { tr.raison }
                </div>
            </div>)
        }
    </>
})

export const head: DocumentHead = {
    frontmatter: {
        back_url: '/admin/transactions'
    }
}