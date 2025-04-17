import { component$, Slot } from "@builder.io/qwik";
import { Link, useDocumentHead, useLocation } from "@builder.io/qwik-city";
import Live from "~/assets/live.svg?jsx"
import Bank from "~/assets/bank.svg?jsx"

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
        path: '/home/bank/',
        slot: <>
            <Bank/>
            <span class="hidden sm:block">
                Banque
            </span>
        </>
    },
]

export default component$(() => {
    const head = useDocumentHead();
    const loc = useLocation();

    if(head.frontmatter.home_layout === false) return <Slot/>

    return <section class="p-4 lg:p-16 md:p-8 flex flex-col gap-2 lg:gap-4 xl:gap-5">
        <header class="flex flex-row items-center justify-between text-xl font-sobi">
            <nav class="flex flex-row items-center gap-2">
                {
                    liens.map((lien, i) => <Link key={i} href={lien.path}
                        class={[
                        "p-2 sm:px-3 rounded-md flex flex-row items-center gap-2",
                        lien.path === loc.url.pathname
                        ? "bg-pink text-white"
                        : "bg-white/25 hover:bg-white/50"
                    ]}>
                        { lien.slot }
                    </Link>)
                }
            </nav>
            <div class="p-1.5 sm:p-2 bg-white/25 rounded-md font-sobi whitespace-nowrap">
                100000000 <span class="text-sm text-pink">agl</span>
            </div>
        </header>
        <Slot/>
</section>
})