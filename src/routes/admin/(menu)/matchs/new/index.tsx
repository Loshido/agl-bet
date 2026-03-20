import { component$, useSignal, useStore } from "@builder.io/qwik";
import Icon from "~/assets/icon.png?jsx"
import { type DocumentHead, server$, useNavigate } from "@builder.io/qwik-city";

interface Match {
    titre: string,
    informations: string,
    ouverture: Date | null,
    fermeture: Date | null,
    equipes: string[]
}

import pg from "~/lib/pg";
export const createMatch = server$(async (match: Match): Promise<string> => {
    if(match.titre.length === 0) 
        return "Le titre n'est pas défini"
    if(match.informations.length === 0) 
        return "La description n'est pas défini"
    if(match.fermeture === null) 
        return "La fermeture n'est pas défini"
    if(match.ouverture === null) 
        return "L'ouverture n'est pas défini"
    if(match.equipes.length < 2)
        return "Il n'y a pas assez d'équipes"
    if(match.equipes.some(eq => eq.length === 0))
        return "Une ou plusieurs équipes ne sont pas défini correctement"

    const client = await pg()

    const response = await client.query<Match & { id: number, agl: number, participants: number }>(
        `INSERT INTO matchs 
        (titre, informations, ouverture, fermeture, equipes, statut)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [   
            match.titre, 
            match.informations, 
            match.ouverture, 
            match.fermeture,
            JSON.stringify(match.equipes),
            "en attente"
        ]
    )

    client.release()

    if(!response.rowCount) {
        console.error(
            "[admin][db] Erreur dans l'insertio d'un match.", 
            response
        )
    }
    return response.rowCount ? 'ok' : "Impossible d'insérer le match."
})

export default component$(() => {
    const nav = useNavigate()
    const erreurs = useSignal('')
    const match = useStore<Match>({
        titre: '',
        informations: '',
        ouverture: null,
        fermeture: null,
        equipes: []
    })

    return <section class="w-full md:w-fit flex flex-col gap-1 
        bg-white/10 p-4 rounded-md relative
        md:mx-auto md:min-w-2xl">
        <input placeholder="Titre du match"
            class="font-sobi text-3xl outline-none 
            placeholder:animate-pulse placeholder:text-pink"
            onInput$={(_, t) => match.titre = t.value}/>
        <div class="flex flex-col gap-2" >
            <input type="text" onInput$={(_, t) => match.informations = t.value}
                placeholder="Une description suffisament explicite"
                class="outline-none placeholder:text-pink placeholder:animate-pulse"/>
            <div class="w-full sm:grid grid-cols-2 py-2 text-xl flex flex-col
                justify-items-center items-center text-center justify-center">
                <div class="flex flex-col items-center gap-1">
                    <span class="text-sm text-center">
                        Ouverture
                    </span>
                    <input type="datetime-local" 
                        class="font-avenir font-medium w-48 text-center outline-none
                        placeholder:animate-pulse placeholder:text-pink"
                        onInput$={(_, t) => match.ouverture = new Date(t.value)}/>
                </div>
                <div class="flex flex-col items-center gap-1">
                    <span class="text-sm text-center">
                        Fermeture
                    </span>
                    <input type="datetime-local" 
                        class="font-avenir font-medium w-48 text-center outline-none"
                        onInput$={(_, t) => match.fermeture = new Date(t.value)}/>
                </div>
            </div>
        </div>

        <div class="flex flex-row flex-wrap items-center py-4 overflow-x-auto gap-2">
            {
                match.equipes.map((equipe, i, a) => <div 
                    key={i}
                    class="flex flex-row items-center gap-2">
                    <div 
                        class="py-2 flex flex-col gap-1 
                            items-center justify-center">
                        <Icon class="h-12 w-12 rounded-md"/>
                        <input type="text"
                            placeholder="Equipe"
                            class="font-sobi text-center outline-none w-24 min-w-16
                                placeholder:animate-pulse placeholder:text-pink"
                            onInput$={(_, t) => {
                                match.equipes[i] = t.value
                            }}/>
                    </div>
                    {
                        i + 1 !== a.length && <span class="font-sobi text-pink">
                            VS
                        </span>
                    }
                </div>)
            }
            <div class={["py-2 flex flex-col gap-1 ml-4",
                "items-center justify-center group",
                "cursor-pointer select-none",
                match.equipes.length < 2 && 'animate-pulse text-pink']}
                onClick$={() => match.equipes.push('')}>
                <div class="h-12 w-12 bg-white/25 text-white flex items-center 
                    justify-center font-bold rounded-md  group-hover:bg-white/50 transition-colors">
                    +
                </div>
                <p class="font-sobi text-center">
                    Nouvelle équipe
                </p>
            </div>
            
        </div>
        <div class="flex flex-row items-center gap-2">
            <button class="px-2 py-1 sm:px-3 rounded-md flex flex-row items-center gap-2
                transition-colors w-fit font-avenir
                disabled:bg-white/25 disabled:cursor-not-allowed disabled:text-white/50
                hover:bg-pink/75 bg-pink/50 cursor-pointer"
                disabled={
                    match.equipes.length < 2 || 
                    !match.fermeture || !match.ouverture || 
                    match.equipes.some(eq => eq.length === 0) ||
                    match.titre.length == 0 || match.informations.length== 0
                }
                onClick$={async (_, t) => {
                    if(!t.disabled) {
                        const response = await createMatch(match);
                        if(response === 'ok') await nav('/admin/matchs')
                        else erreurs.value = response
                    }
                }}>
                Créer le match
            </button>
            <div class="px-2 py-1">
                { erreurs.value }
            </div>
        </div>
    </section>
})

export const head: DocumentHead = {
    frontmatter: {
        back_url: '/admin/matchs'
    }
}