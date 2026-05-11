import { $, component$, useStore } from "@builder.io/qwik";
import { Link, routeLoader$, server$ } from "@builder.io/qwik-city";
import { Toggle } from "~/components/admin/toggle";
import { Payload } from "~/lib/jwt";
import kv from "~/lib/kv"

export const useData = routeLoader$(ctx => {
    const inscriptions = kv.get('inscriptions') === '1'
    const ballons = kv.get('ballons') === '1'
    const payload = ctx.sharedMap.get('payload') as Payload

    return {
        inscriptions,
        ballons,
        payload
    }
})

const Links = () => <>
    <Link class="text-4xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
        cursor-pointer font-sobi transition-colors" prefetch={false}
        href="/admin/comptes/pending">
        Comptes
    </Link>
    <Link class="text-4xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
        cursor-pointer font-sobi transition-colors" prefetch={false}
        href="/admin/matchs">
        Matchs
    </Link>
    <Link class="text-4xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
        cursor-pointer font-sobi transition-colors" prefetch={false}
        href="/admin/retraits">
        Retraits
    </Link>
    <Link class="text-4xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
        cursor-pointer font-sobi transition-colors" prefetch={false}
        href="/admin/transactions">
        Transactions
    </Link>
</>

export const toggle_inscriptions = server$(function() {
    const inscriptions = kv.get('inscriptions')
    const next = inscriptions === '0' ? '1' : '0'
    kv.set('inscriptions', next)

    return next
})

export const toggle_ballons = server$(function() {
    const ballons = kv.get('ballons')
    const next = ballons === '0' ? '1' : '0'
    kv.set('ballons', next)

    return next
})

export default component$(() => {
    const data = useStore(useData().value)

    const inscriptions = $(async () => {
        const inscriptions = await toggle_inscriptions()
        data.inscriptions = inscriptions === '1'
    })
    const ballons = $(async () => {
        const ballons = await toggle_ballons()
        data.ballons = ballons === '1'
    })

    return <section class="p-4 lg:p-16 md:p-8 flex flex-col gap-2 lg:gap-3 xl:gap-4 relative">
        <p class="py-2 mx-4 text-pink">
            Connecté en tant que { data.payload.pseudo }
        </p>
        <Links/>
        <Toggle onClick={inscriptions}
            options={[
            {
                text: "Ouvertes",
                active: data.inscriptions,
            },
            {
                text: "Terminées",
                active: !data.inscriptions,
            }
        ]}>
            Inscriptions
        </Toggle>
        <Toggle onClick={ballons}
            options={[
            {
                text: "Activés",
                active: data.ballons,
            },
            {
                text: "Désactivés",
                active: !data.ballons,
            },
        ]}>
            Confettis
        </Toggle>
        <Link class="text-xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
            cursor-pointer font-sobi transition-colors" prefetch={false}
            href="/home">
            Application
        </Link>
    </section>
})