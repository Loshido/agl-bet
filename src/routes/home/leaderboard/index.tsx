import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

interface Utilisateur {
    pseudo: string,
    agl: number
}

import pg from "~/lib/pg";
export const useClassement = routeLoader$(async () => {
    const client = await pg()

    // On déduit le crédit pour que le classement soit + accurate
    const response = await client.query<Utilisateur>(
        `SELECT utilisateurs.pseudo, agl + coalesce(-credits.du, 0) AS agl
        FROM utilisateurs
        LEFT JOIN credits ON utilisateurs.pseudo = credits.pseudo 
        AND credits.status != 'rembourse'
        ORDER BY (utilisateurs.agl + coalesce(-credits.du, 0)) DESC`
    )

    client.release()
    return response.rows
})

export default component$(() => {
    const classement = useClassement()
    return <>
        <h1>
            Podium
        </h1>
        <div class="grid grid-cols-7 font-black">
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
            classement.value.map((joueur, i) => <div
                class="grid grid-cols-7">
                <p class="font-light text-pink text-sm text-center">
                    { i + 1 }
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