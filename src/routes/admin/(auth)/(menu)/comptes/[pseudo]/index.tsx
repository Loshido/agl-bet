import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead, Link, routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import Button from "~/components/admin/button";

interface Utilisateur {
    pseudo: string,
    agl: number
}

interface Credit {
    credit: number,
    du: number,
    at: Date,
    status: 'rembourse' | 'remboursement' | 'en attente'
}

interface Retrait {
    agl: number,
    effectif: boolean,
    at: Date
}

interface Profile extends Utilisateur {
    credits: Credit[],
    retraits: Retrait[]
}

const queries = {
    utilisateurs: `
        SELECT pseudo, agl FROM utilisateurs WHERE pseudo = $1
    `,
    credits: `
        SELECT credit, du, at, status
        FROM credits WHERE pseudo = $1
        ORDER BY at DESC
    `,
    retraits: `
        SELECT effectif, agl, at FROM retraits
        WHERE pseudo = $1
        ORDER BY at DESC
    `
}

import pg from "~/lib/pg";
import { admin, tokens } from "~/routes/admin/auth";
import redis from "~/lib/redis";
const modifyAGL = server$(async function(pseudo: string, agl: number) {
    const token = this.cookie.get('admin');
    const administrateur = admin === token?.value
        ? { name: 'root' }
        : tokens.get(token?.value || '')
    if(!administrateur) {
        return
    }

    const client = await pg();

    await client.query('BEGIN')
    try {
        const agls = await client.query<{ agl: number }>(
            `SELECT agl FROM utilisateurs WHERE pseudo = $1`,
            [pseudo]
        )
        if(!agls.rowCount) throw new Error("n'existe pas")

        await client.query(
            `INSERT INTO transactions (pseudo, agl, raison)
            VALUES ($1, $2, $3)`,
            [pseudo, agl - agls.rows[0].agl, "Action staff"]
        )
        await client.query(`
            UPDATE utilisateurs SET agl = $2
            WHERE pseudo = $1`,
            [pseudo, agl]
        );
        console.log(`[admin] ${ pseudo } a désormais ${agl} agl`
            + ` (${ administrateur.name })`)
        
        await client.query('COMMIT')
    } catch(e) {
        await client.query('ROLLBACK')
    }
    
    client.release()
    await redis.hDel('payload', pseudo)
})

export const useProfile = routeLoader$(async ctx => {
    const pseudo = ctx.params.pseudo
    const client = await pg()

    const [ utilisateur, credits, retraits ] = await Promise.all([
        client.query<Utilisateur>(queries.utilisateurs, [pseudo]),
        client.query<Credit>(queries.credits, [pseudo]),
        client.query<Retrait>(queries.retraits, [pseudo])
    ])

    if(!utilisateur.rowCount) return null

    client.release()
    return {
        ...utilisateur.rows[0],

        credits: credits.rows,
        retraits: retraits.rows
    } satisfies Profile
})

export default component$(() => {
    const loc = useLocation()
    const profile = useProfile()
    const entree = useSignal('')

    return <div>
        <h1 class="font-bold text-2xl my-4">
            Profile de { loc.params.pseudo }
        </h1>
        {
            profile.value === null 
            ? <>
                Profile introuvable ⚠️
            </>
            : <>
                <div class="p-2 grid grid-cols-3 gap-2 items-center">
                    <p class="col-span-2 font-sobi text-2xl">
                        <span contentEditable="true" class="outline-none"
                            onInput$={(_, t) => entree.value = t.innerText}>
                            {profile.value.agl}
                        </span>
                        <span class="text-xs text-pink mx-2">
                            agl
                        </span>
                    </p>
                    <Button onClick$={async () => {
                        const agl = parseInt(entree.value)
                        if(agl >= 0) {
                            await modifyAGL(profile.value.pseudo, agl)
                        }
                    }}>
                        Modifier
                    </Button>
                </div>
                <hr class="my-4 border-white/25 rounded-md"/>

                <h2 class="font-black text-xl my-2">
                    Crédits
                </h2>
                <div class="flex flex-col gap-1 w-full">
                    <div class="grid grid-cols-7 font-bold py-2">
                        <p class="text-center">
                            Heure
                        </p>
                        <p class="col-span-2 text-center">
                            Crédit
                        </p>
                        <p class="col-span-2 text-center">
                            Dû
                        </p>
                        <div class="col-span-2 text-center">
                            Status
                    </div>
                    </div>
                    {
                        profile.value.credits.map((credit, i) => <div key={i} 
                            class="grid grid-cols-7">
                            <p class="text-sm text-center">
                                { credit.at.toLocaleTimeString(undefined, { 
                                    timeStyle: 'short' 
                                }) }
                            </p>
                            <p class="font-sobi text-xs col-span-2 text-center">
                                { credit.credit } <span class=" text-pink">
                                    agl
                                </span>
                            </p>
                            <p class="font-sobi text-xs col-span-2 text-center">
                                { credit.du } <span class="text-pink">
                                    agl
                                </span>
                            </p>
                            <div class="flex items-center justify-center h-full w-full  col-span-2">
                                <p class={["px-1 py-0.5 text-sm rounded-sm",
                                    credit.status === 'rembourse' && 'bg-emerald-600',
                                    credit.status === 'remboursement' && 'bg-sky-600',
                                    credit.status === 'en attente' && 'bg-gray-500'
                                ]}>
                                    { credit.status === 'rembourse' 
                                        ? 'remboursé' 
                                        : credit.status }
                                </p>
                            </div>
                        </div>)
                    }
                </div>

                <hr class="my-4 border-white/25 rounded-md"/>

                <h2 class="font-black text-xl my-2">
                    Retraits
                </h2>
                <div class="flex flex-col gap-1 w-full">
                    <div class="grid grid-cols-4 font-bold py-2">
                        <p class="text-center">
                            Heure
                        </p>
                        <p class="col-span-2 text-center">
                            Argents
                        </p>
                        <div class="col-span text-center">
                            Confirmation
                    </div>
                    </div>
                    {
                        profile.value.retraits.map((retrait, i) => <div key={i} 
                            class="grid grid-cols-4">
                            <p class="text-sm text-center">
                                { retrait.at.toLocaleTimeString(undefined, { 
                                    timeStyle: 'short' 
                                }) }
                            </p>
                            <p class="font-sobi text-xs col-span-2 text-center">
                                { retrait.agl } <span class=" text-pink">
                                    agl
                                </span>
                            </p>
                            <p class="text-sm text-center">
                                { retrait.effectif ? 'confirmé' : 'en attente' }
                            </p>
                        </div>)
                    }
                </div>

                <hr class="my-4 border-white/25 rounded-md"/>
                <Link 
                    href={`/admin/transactions/${profile.value.pseudo}`}
                    class="font-black text-xl my-2
                    py-1.5 px-2 text-center hover:bg-white/50
                    bg-white/25 cursor-pointer select-none rounded-sm">
                    Transactions
                </Link>
            </>
        }
    </div>
})

export const head: DocumentHead = {
    frontmatter: {
        back_url: '/admin/comptes/'
    }
}