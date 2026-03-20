import { $, component$, useStore } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { verify } from "~/lib/jwt";
import pg from "~/lib/pg";


export const useAdminAccounts = routeLoader$(async () => {
    const client = await pg()

    const response = await client.query<{ pseudo: string, agl: number }>(`SELECT pseudo, agl FROM utilisateurs
        WHERE roles ? 'admin'`)

    client.release()

    return response.rows
})

export const declasser = server$(async function(pseudo: string) {
    const token = this.cookie.get('token')?.value
    const payload = token ? await verify(token, this.env) : null
    if(!payload || !payload.roles.includes('admin')) return false
    const client = await pg()

    const r1 = await client.query<{ roles: string[] }>(`SELECT roles FROM utilisateurs WHERE pseudo = $1`, [ pseudo ])
    if(!r1.rowCount) return false


    const roles = r1.rows[0].roles.filter(role => role !== 'admin')
    const response = await client.query(`UPDATE utilisateurs SET roles = $1::jsonb WHERE pseudo = $2`, [
        JSON.stringify(roles),
        pseudo
    ])

    return response.rowCount === 1
})

export default component$(() => {
    const signal = useAdminAccounts()
    const users = useStore(signal.value)

    return <>
        {
            users.map((user, i) => <div key={i}
                class="flex flex-row items-center px-2 gap-2">
                <p class="font-bold mx-2">
                    {user.pseudo}
                </p>
                <div class="px-2 py-1 bg-white/25 hover:bg-white/50 transition-colors rounded-sm
                    cursor-pointer select-none"
                    onClick$={async () => {
                        if(await declasser(user.pseudo)) {
                            users.splice(i, 1)
                        }
                    }}>
                    Déclasser
                </div>
            </div>)
        }
    </>
}) 