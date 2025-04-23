import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import Back from "~/assets/icons/back.svg?jsx"
export default component$(() => {
    return <section class="p-4 lg:p-16 md:p-8 flex flex-col gap-2 lg:gap-4 xl:gap-5 relative">
        <Link href="/admin" class="p-2 sm:px-3 rounded-md flex flex-row items-center gap-2
            transition-colors bg-white/25 hover:bg-white/50 w-fit font-avenir">
            <Back class="h-4 w-4 p-1"/>
            Revenir au menu
        </Link>
        <Slot/>
    </section>
})