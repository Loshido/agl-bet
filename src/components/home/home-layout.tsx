import { Slot } from "@builder.io/qwik";
import { Link, type RouteLocation } from "@builder.io/qwik-city";

import Live from "~/assets/icons/live.svg?jsx"
import Leader from "~/assets/icons/leader.svg?jsx"
const liens = [
    {
        path: '/home/match/',
        slot: <>
            match
        </>
    },
    {
        path: '/home/live/',
        slot: <>
            <Live/>
            <span class="hidden sm:block">
                Live
            </span>
        </>
    },
    {
        path: '/home/leaderboard/',
        slot: <>
            <Leader/>
            <span class="hidden sm:block">
                Classement
            </span>
        </>
    },
]

interface Props {
    location: RouteLocation,
    agl: number
}

export default ({ location, agl }: Props) => <section 
    class="min-h-svh p-4 md:p-8 flex flex-col gap-2 lg:gap-4 xl:gap-5 overflow-hidden relative">
    <header class="flex flex-row items-center justify-between text-xl font-sobi z-10">
        <nav class="flex flex-row items-center gap-2">
            {
                liens.map((lien, i) => <Link key={i} href={lien.path} prefetch={false}
                    class={[
                    "p-2 sm:px-3 rounded-md flex flex-row items-center gap-2",
                    lien.path === location.url.pathname
                    ? "bg-pink text-white"
                    : "bg-white/25 hover:bg-white/50"
                ]}>
                    { lien.slot }
                </Link>)
            }
        </nav>
        <Link class="py-1.5 px-3 bg-white/25 hover:bg-white/50 rounded-md font-sobi whitespace-nowrap"
            href="/home/bank" prefetch={false}>
            { agl } <span class="text-sm text-pink">agl</span>
        </Link>
    </header>
    <Slot/>
</section>