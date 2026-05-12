import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Podium from "~/components/classement/podium";
import Fond from "~/assets/fond.svg?jsx"
import confetti from "./confetti"

interface Utilisateur {
    pseudo: string,
    agl: number
}

import pg from "~/lib/pg";
import kv from "~/lib/kv"

export const useClassement = routeLoader$(async () => {
    const client = await pg()
    const ballons = kv.get('ballons') === '1'
    
    const response = await client.query<Utilisateur>(
        `SELECT pseudo, agl
        FROM utilisateurs
        WHERE roles ? 'user'
        ORDER BY agl DESC`
    )    
    client.release()
    return [response.rows, ballons] as [Utilisateur[], boolean]
})

export default component$(() => {
    const signal = useClassement()
    const classement = useStore(signal.value[0])

    useVisibleTask$(() => {
        if(!signal.value[1]) return
        confetti()
    })

    return <>
        <div class="-z-10 *:absolute *:top-0 *:left-0 *:w-full *:h-full">
            <canvas id="confetti" class="z-10"/>
            <Fond/>
        </div>
        <div class="mx-auto my-4 md:mt-8">
            <Podium 
                players={
                    classement.length < 3
                    ? [{ pseudo: 'x', agl: 0 },{ pseudo: 'x', agl: 0 },{ pseudo: 'x', agl: 0 }]
                    : classement.slice(0, 3) as [Utilisateur, Utilisateur, Utilisateur]} />
        </div>
        <div class="grid grid-cols-7 font-black lg:px-48 xl:px-96 gap-y-3">
            <p class="font-sobi text-sm text-center">
                N°
            </p>
            <p class="font-sobi col-span-4">
                Pseudo
            </p>
            <p class="font-sobi col-span-2">
                Score
            </p>
            {
                classement
                    .slice(3)
                    .map((joueur, i) => <>
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
                </>)
            }
        </div>
    </>
})