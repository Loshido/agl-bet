import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";

interface Transaction {
    pseudo: string
}

import pg from "~/lib/pg";
export const useTransactions = routeLoader$(async () => {
    const client = await pg()

    const response = await client.query<Transaction>(
        `SELECT pseudo FROM utilisateurs WHERE roles ? 'user'`
    )

    client.release()

    return response.rows
})

export default component$(() => {
    const transactions = useTransactions()
    return <>
        <h1 class="font-bold text-2xl my-2">
            Transactions des utilisateurs
        </h1>
        <section class="flex flex-col gap-1">
        {
            transactions.value.map(tr => <Link
                key={tr.pseudo} prefetch={false}
                class="py-1.5 px-3 font-bold hover:bg-white/50 font-sans
                bg-white/25 cursor-pointer select-none rounded-sm"
                href={`/admin/transactions/${ tr.pseudo }`}>
                {tr.pseudo}
            </Link>)
        }
        </section>
    </>
})