import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$, server$ } from "@builder.io/qwik-city";
import pg from "~/lib/pg";
import Equipe from "~/routes/home/match/[id]/Equipe";

export const useMatch = routeLoader$(async ctx => {
    const id = ctx.params.id;
    const client = await pg();

    const matchs = await client.query<{ 
        equipes: string[], 
        titre: string, 
        informations: string 
    }>(
        `SELECT titre, informations, equipes FROM matchs WHERE 
        id = $1 AND fermeture < now() AND statut = 'en attente'`,
        [id]
    )
    client.release()

    if(!matchs.rowCount) {
        throw ctx.redirect(302, '/admin/matchs')
    }

    return matchs.rows[0]
})

import redis from "~/lib/redis"
export const choisirGagnant = server$(async function(gagnant: string) {
    const client = await pg()
    try {
        await client.query('BEGIN')
        const agls = await client.query<{ agl: number }>(
            `UPDATE matchs SET statut = $2
            WHERE id = $1 RETURNING agl`,
            [this.params.id, gagnant]
        )
        if(!agls.rowCount) throw new Error("Le match n'existe pas")
        const cagnotte = agls.rows[0].agl

        const paris = await client.query<{ pseudo: string, agl: number }>(
            `SELECT pseudo, agl FROM paris
            WHERE match = $1 AND equipe = $2`,
            [this.params.id, gagnant]
        )

        const cagnotte_gagnante = paris.rows.reduce(
            (pre, val) => val.agl + pre, 0)
        const cote = cagnotte / cagnotte_gagnante
        console.log(`[admin] Le gagnant du match ${ this.params.id }`
            + ` est ${gagnant} avec une cote à ${cote}`);
            
        for(const { pseudo, agl } of paris.rows) {
            await client.query(
                `UPDATE utilisateurs SET agl = agl + $2
                WHERE pseudo = $1`,
                [pseudo, cote * agl]
            )
            await client.query(
                `INSERT INTO transactions (pseudo, agl, raison)
                VALUES ($1, $2, $3)`,
                [pseudo, cote * agl, `Pari gagnant (${this.params.id})`]
            )
            await redis.hDel('payload', pseudo)
        }

        await client.query('COMMIT')
        // /live récuperer les paris **ouverts**
        // /match récupérer les matchs **ouverts**
    } catch(e) {
        await client.query('ROLLBACK')
        console.error('[admin][db]',e)
    }
    client.release()
})

export default component$(() => {
    const match = useMatch()
    const gagnant = useSignal<string | null>(null)
    return <>
        <h2 class="font-sobi text-2xl">
            { match.value.titre }
        </h2>
        <p class="text-white/75 text-wrap">
            { match.value.informations }
        </p>
        <h2 class="text-xl font-semibold">
            Choix du gagnant
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 w-full">
            { 
                match.value.equipes.map(equipe => <Equipe
                key={equipe}
                equipe={equipe}
                image={null}
                cote={0}
                onClick$={() => {
                    gagnant.value = equipe
                }}
                class={ gagnant.value === equipe
                    ? 'bg-pink/25'
                    : 'bg-white/10' }
            />) }
        </div>

        <button disabled={!gagnant.value}
            class="px-2 py-1 sm:px-3 rounded-md flex flex-row items-center gap-2
                transition-colors w-fit font-avenir
                disabled:bg-white/25 disabled:cursor-not-allowed disabled:text-white/50
                hover:bg-pink/75 bg-pink/50 cursor-pointer"
            onClick$={async () => {
                const confirmation = prompt(
                    `Entrez 'oui' pour choisir ${gagnant.value} en tant que gagnant du match.`
                )
                if(confirmation === 'oui' && gagnant.value) {
                    await choisirGagnant(gagnant.value)
                }
            }}>
            Envoyer
        </button>
    </>
})

export const head: DocumentHead = {
    frontmatter: {
        back_url: '/admin/matchs'
    }
}