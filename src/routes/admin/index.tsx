import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { Payload } from "~/lib/jwt";

export const usePayload = routeLoader$(ctx => {
    return ctx.sharedMap.get('payload') as Payload
})

export default component$(() => {
    const payload = usePayload()

    return <section class="p-4 lg:p-16 md:p-8 flex flex-col gap-2 lg:gap-3 xl:gap-4 relative">
        <p class="py-2 mx-4 text-pink">
            Connecté en tant que { payload.value.pseudo }
        </p>
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
            href="/admin/credits">
            Crédits
        </Link>
        <Link class="text-4xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
            cursor-pointer font-sobi transition-colors" prefetch={false}
            href="/admin/transactions">
            Transactions
        </Link>
    </section>
})