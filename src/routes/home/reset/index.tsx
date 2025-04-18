import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { Link, RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = ctx => {
    ctx.cookie.delete('transactions', {
        path: '/home/bank/history',
    })
}

export default component$(() => {

    useVisibleTask$(() => {
        localStorage.clear()
        sessionStorage.clear()
    })
    return <section class="w-svw h-svh flex flex-col gap-4 items-center justify-center">
        <h2>
            Cache supprimé
        </h2>

        <Link href="/home/match" class="font-sobi hover:text-pink transition-colors">
            Revenir à l'accueil
        </Link>
    </section>
})