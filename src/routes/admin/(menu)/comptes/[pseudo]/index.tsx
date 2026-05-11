import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead, Link, routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import Button from "~/components/admin/button";
import { verify } from "~/lib/jwt";

interface Utilisateur {
    pseudo: string,
    agl: number
}

interface Retrait {
    agl: number,
    effectif: boolean,
    at: Date
}

interface Profile extends Utilisateur {
    retraits: Retrait[]
}

const queries = {
    utilisateurs: `
        SELECT pseudo, agl FROM utilisateurs WHERE pseudo = $1
    `,
    retraits: `
        SELECT effectif, agl, at FROM retraits
        WHERE pseudo = $1
        ORDER BY at DESC
    `
}

import pg from "~/lib/pg";

const add_agl = server$(async function(pseudo: string, agl: number) {
    const token = this.cookie.get('token')?.value
    const payload = token ? await verify(token, this.env) : null
    if(!payload) return false
    const client = await pg();
    
    try {
        await client.query('BEGIN;')
        const data = await client.query(
            `SELECT 1 FROM utilisateurs 
            WHERE pseudo = $1 AND (roles ? 'root' OR roles ? 'admin');`, 
            [payload?.pseudo]
        )
        if(data.rowCount === 0) throw 'Not allowed'
        await client.query(
            `UPDATE utilisateurs SET agl = agl + $2 
            WHERE pseudo = $1;`, [pseudo, agl]);

        await client.query('COMMIT;')
        client.release()
        return true
    } catch(e) {
        await client.query('ROLLBACK;')
        client.release()
        return false
    }
})
const set_agl = server$(async function(pseudo: string, agl: number) {
    const token = this.cookie.get('token')?.value
    const payload = token ? await verify(token, this.env) : null
    if(!payload) return false
    const client = await pg();
    
    try {
        await client.query('BEGIN;')
        const data = await client.query(
            `SELECT 1 FROM utilisateurs 
            WHERE pseudo = $1 AND (roles ? 'root' OR roles ? 'admin');`, 
            [payload?.pseudo]
        )
        if(data.rowCount === 0) throw 'Not allowed'
        await client.query(
            `UPDATE utilisateurs SET agl = $2 
            WHERE pseudo = $1;`, [pseudo, agl]);

        await client.query('COMMIT;')
        client.release()
        return true
    } catch(e) {
        await client.query('ROLLBACK;')
        client.release()
        return false
    }
})

export const useProfile = routeLoader$(async ctx => {
    const pseudo = ctx.params.pseudo
    const client = await pg()

    const [ utilisateur, retraits ] = await Promise.all([
        client.query<Utilisateur>(queries.utilisateurs, [pseudo]),
        client.query<Retrait>(queries.retraits, [pseudo])
    ])

    if(!utilisateur.rowCount) return null

    client.release()
    return {
        ...utilisateur.rows[0],
        retraits: retraits.rows
    } satisfies Profile
})

export default component$(() => {
    const loc = useLocation()
    const profile = useProfile()

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
                        <span>
                            {profile.value.agl}
                        </span>
                        <span class="text-xs text-pink mx-2">
                            agl
                        </span>
                    </p>
                    <div class="flex flex-row gap-2">
                        <Button onClick$={async () => {
                            const agl = parseInt(prompt("Somme à ajouter") || '')
                            if(agl < 0 || agl > 0) {
                                const success = await add_agl(profile.value.pseudo, agl)
                                if(success) profile.value.agl += agl
                            }
                        }}>
                            Ajouter
                        </Button>
                        <Button onClick$={async () => {
                            const agl = parseInt(prompt("Nouvelle somme") || '')
                            if(agl >= 0) {
                                const success = await set_agl(profile.value.pseudo, agl)
                                if(success) profile.value.agl = agl
                            }
                        }}>
                            Modifier
                        </Button>
                    </div>
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