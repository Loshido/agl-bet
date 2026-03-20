import { Link } from "@builder.io/qwik-city"

import Back from "~/assets/icons/back.svg?jsx"
import Send from "~/assets/icons/send.svg?jsx"
import History from "~/assets/icons/history.svg?jsx"
import Withdraw from "~/assets/icons/withdraw.svg?jsx"
import Logout from "~/assets/icons/logout.svg?jsx"

interface MenuProps {
    agl: number
}

const liens = [
    {
        label: "Envoyer de l'argent",
        icon: <Send class="w-10 h-10 *:stroke-3 *:duration-500 *:transition-colors
                    *:stroke-white group-hover:*:stroke-pink"/>,
        href: "/home/bank/send"
    },
    {
        label: "Retirer de l'argent",
        icon: <Withdraw class="w-10 h-10 *:stroke-3 *:duration-500 *:transition-colors
            *:stroke-white group-hover:*:stroke-pink"/>,
        href: "/home/bank/withdraw"
    },
    {
        label: "Historique",
        icon: <History class="w-10 h-10 *:stroke-3 *:duration-500 *:transition-colors
            *:stroke-white group-hover:*:stroke-pink"/>,
        href: "/home/bank/history"
    },
]

export default ({ agl }: MenuProps) => <section class="flex flex-col gap-4 p-2 lg:px-80">
    <header class="w-full flex flex-row items-center justify-center p-4 relative">
        <Link class="p-2 rounded-md flex flex-row items-center gap-2 
            bg-white/25 hover:bg-white/50
            absolute left-4"
            href="/home/match">
            <Back/>
        </Link>
        <h2 class="font-sobi text-white text-4xl">
            { agl } <span class="text-sm text-pink">agl</span>
        </h2>
    </header>
    <nav class="w-full h-full flex flex-col justify-between select-none">
        <div class="flex flex-col gap-2">
            {
                liens.map(lien => <Link key={lien.href} prefetch={false} href={lien.href}
                    class="font-sobi text-2xl sm:text-3xl p-4 hover:bg-white/10 rounded-md
                        hover:text-pink text-white group
                        transition-colors duration-500
                        flex flex-row items-center gap-4">
                    {lien.icon}
                    {lien.label}
                </Link>)
            }
        </div>
        <div class="flex flex-col gap-2">
            <Link class="font-sobi text-2xl sm:text-3xl p-4 hover:bg-white/10 rounded-md
                hover:text-pink text-white group
                transition-colors duration-500
                flex flex-row items-center gap-4"
                prefetch={false}
                href="/deconnexion">
                <Logout class="w-10 h-10 *:stroke-3 *:duration-500 *:transition-colors
                    *:stroke-white group-hover:*:stroke-pink"/>
                Déconnexion
            </Link>
        </div>
    </nav>
</section>