import { component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { Link, server$ } from "@builder.io/qwik-city";
import pg from "~/lib/pg"
import Back from "~/assets/icons/back.svg?jsx"
import { verify } from "~/lib/jwt";
import { Transaction } from "~/components/home/bank/transaction";
import { MetaContext } from "../../layout";

interface Transaction {
    id: number, 
    agl: number, 
    raison: string, 
    at: Date
}

type TransactionLocal = Omit<Transaction, 'at'> & { at: number }
export const getTransactions = server$(async function(date: Date): Promise<TransactionLocal[]> {
    const token = this.cookie.get('token')?.value
    const payload = token ? await verify(token, this.env) : null
    if(!payload || (date.getTime() > Date.now() - 1000 * 15)) return []

    const client = await pg()
    const response = await client.query<Transaction>(
        `SELECT id, agl, raison, at FROM transactions
        WHERE pseudo = $1 AND at >= $2 ORDER BY at DESC`,
        [ payload.pseudo, date  ]
    )
    
    client.release()
    return response.rows.map(t => ({...t, at: t.at.getTime()})) 
})

export default component$(() => {    
    const meta = useContext(MetaContext)
    const transactions = useStore<TransactionLocal[]>([])

    useVisibleTask$(async () => {
        // on récupère les transactions stockées
        const stored = localStorage.getItem('transactions')
        const old: TransactionLocal[] = stored ? JSON.parse(stored) : []
        transactions.push(...old)
        
        // on récupère les nouvelles transactions (on ne récupère pas les anciennes)
        const tr = await getTransactions(new Date(old.at(0)?.at || 0))
        for(const t of tr) {
            if(transactions.find(transaction => transaction.id === t.id)) continue
            transactions.push(t)
        }
        
        transactions.sort((a, b) => b.at - a.at)
        // on stocke les transactions
        localStorage.setItem('transactions', JSON.stringify(transactions))
    })

    return <section class="flex flex-col gap-4 p-2 lg:px-80">
        <header class="w-full flex flex-row items-center justify-center p-4 relative">
            <Link class="p-2 rounded-md flex flex-row items-center gap-2 
                bg-white/25 hover:bg-white/50
                absolute left-4"
                href="/home/bank">
                <Back/>
            </Link>
            <h2 class="font-sobi text-white text-4xl">
                { meta.agl } <span class="text-sm text-pink">agl</span>
            </h2>
        </header>
        <h1 class="px-4 sm:px-8 text-2xl font-bold">
            Historique des transactions
        </h1>
        <section class="flex flex-col w-full">
            {
                transactions.map(tr => <Transaction
                    key={tr.id}
                    agl={tr.agl}
                    raison={tr.raison}
                    date={tr.at}/>)
            }
        </section>
    </section>
})