import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Podium from "~/components/classement/podium";

interface Utilisateur {
    pseudo: string,
    agl: number
}

import pg from "~/lib/pg";
export const useClassement = routeLoader$(async () => {
    const client = await pg()
    
    // On déduit le crédit pour que le classement soit + accurate
    const response = await client.query<Utilisateur>(
        `SELECT pseudo, agl
        FROM utilisateurs
        ORDER BY agl DESC`
    )
    
    client.release()
    return response.rows
})

export default component$(() => {
    const classement = useClassement()
    return <>
        <div class="mx-auto my-4 md:my-8">
            <Podium 
                players={
                    classement.value.length < 3
                    ? [{ pseudo: 'x', agl: 0 },{ pseudo: 'x', agl: 0 },{ pseudo: 'x', agl: 0 }]
                    : classement.value.slice(0, 3) as [Utilisateur, Utilisateur, Utilisateur]} />
        </div>
        <div class="grid grid-cols-7 font-black 
            lg:px-48 xl:px-96">
            <p class="font-sobi text-sm text-center">
                N°
            </p>
            <p class="font-bold col-span-4">
                Pseudo
            </p>
            <p class="text-sm col-span-2">
                Score
            </p>
        </div>
        {
            classement.value
                .slice(3)
                .map((joueur, i) => <div key={i}
                class="grid grid-cols-7 lg:px-48 xl:px-96">
                <p class="font-light text-pink text-sm text-center">
                    { i + 4 }
                </p>
                <p class="font-bold col-span-4">
                    { joueur.pseudo }
                </p>
                <p class="text-sm font-sobi col-span-2">
                    { joueur.agl } <span 
                        class="text-pink text-xs">agl</span>
                </p>
            </div>)
        }
    </>
})