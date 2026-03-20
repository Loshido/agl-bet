import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";

import pg from "~/lib/pg";
interface Utilisateur {
    pseudo: string,
    agl: number
}

export const useUtilisateurs = routeLoader$(async () => {
    const client = await pg();

    const utilisateurs = await client.query<Utilisateur>(
        `SELECT pseudo, agl FROM utilisateurs
        WHERE actif = true`
    )

    client.release()
    return utilisateurs.rows
})

export default component$(() => {
    const utilisateurs = useUtilisateurs()
    return <>
        {
            utilisateurs.value.map((utilisateur, i) => <div 
                key={i}
                class="grid grid-cols-4 gap-2 *:transition-colors items-center">
                <p class="col-span-2">
                    {utilisateur.pseudo} 
                </p>
                <p class="font-sobi">
                    {utilisateur.agl} <span class="text-xs text-pink">agl</span>
                </p>
                <Link class="py-1.5 px-2 font-bold text-center hover:bg-white/50 
                    bg-white/25 cursor-pointer select-none rounded-sm"
                    href={`/admin/comptes/${ utilisateur.pseudo }`}>
                    Voir
                </Link>
            </div>)
        }
    </>
})