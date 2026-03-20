import { component$ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import Button from "~/components/admin/button";

import pg from "~/lib/pg";
interface UtilisateurEnAttente {
    pseudo: string,
    createdat: Date
}

export const useUtilisateurEnAttente = routeLoader$(async () => {
    const client = await pg();

    const utilisateurs = await client.query<UtilisateurEnAttente>(
        `SELECT pseudo, createdat FROM utilisateurs
        WHERE actif = false`
    )

    client.release()
    return utilisateurs.rows
})

export const actionUtilisateur = server$(async (pseudo: string, action: 'accepter' | 'refuser') => {
    const client = await pg();
    await client.query(
        action === 'accepter'
        ? `UPDATE utilisateurs SET actif = true WHERE pseudo = $1`
        : `DELETE FROM utilisateurs WHERE pseudo = $1`,
        [pseudo]
    )

    client.release()
})

export default component$(() => {
    const utilisateurs = useUtilisateurEnAttente()
    return <>
        {
            utilisateurs.value.map((utilisateur, i) => <div
                key={i}
                class="grid grid-cols-4 gap-2 *:transition-colors">
                <p class="col-span-2 overflow-ellipsis font-medium">
                    { utilisateur.pseudo }
                    <span class="mx-2 font-light text-xs">
                        {
                            utilisateur.createdat.toLocaleTimeString(undefined, {
                                timeStyle: 'short'
                            })
                        }
                    </span>
                </p>     
                <Button onClick$={async () => {
                    await actionUtilisateur(utilisateur.pseudo, 'accepter');
                    utilisateurs.value.splice(i, 1)
                } }>
                    Accepter
                </Button>           
                <Button onClick$={async () => {
                    await actionUtilisateur(utilisateur.pseudo, 'refuser')
                    utilisateurs.value.splice(i, 1)
                }}>
                    Refuser
                </Button>           
           </div>)
        }
    </>
})