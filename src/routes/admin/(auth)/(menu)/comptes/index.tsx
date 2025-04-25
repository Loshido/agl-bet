import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Button from "~/components/admin/button";

import pg from "~/lib/pg";
interface Utilisateur {
    pseudo: string,
    agl: number
}

export const useUtilisateurs = routeLoader$(async ctx => {
    const client = await pg();

    const utilisateurs = await client.query<Utilisateur>(
        `SELECT pseudo, agl FROM utilisateurs
        WHERE actif = true`
    )

    client.release()
    return utilisateurs.rows
})
const Utilisateur = ({ pseudo, agl }: { pseudo: string, agl: number }) => <div 
    class="grid grid-cols-4 gap-2 *:transition-colors items-center">
    <p class="col-span-2">
        {pseudo} 
    </p>
    <p class="font-sobi">
        {agl} <span class="text-xs text-pink">agl</span>
    </p>
    <div class="py-1.5 font-bold text-center hover:bg-white/50
        bg-white/25 cursor-pointer select-none rounded-sm">
        Voir
    </div>
</div>

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
                <Button>
                    Voir
                </Button>
            </div>)
        }
        {/* {
            fake_users.map(user => <Utilisateur
                pseudo={user}
                agl={10000}/>)
        } */}
    </>
})