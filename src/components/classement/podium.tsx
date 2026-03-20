import { component$ } from "@builder.io/qwik";

type Player = {
    pseudo: string,
    agl: number
}

interface Podium {
    players: [Player, Player, Player]
}

const Player = ({ p }: { p: Player }) => <>
    <h3 class="font-sobi text-xs md:text-xl text-center">
        { p.pseudo }
    </h3>
    <p class="font-sobi text-xs md:text-base">
        { p.agl }
        <span class="md:text-sm text-pink"> agl</span>
    </p>
</>

import Podium from "~/assets/classement/podium.svg?jsx"
import Spotlight from "~/assets/classement/spotlight.svg?jsx"
export default component$(({ players }: Podium) => <div class="grid grid-cols-3 grid-rows-8 relative isolate
    h-40 md:h-80 w-75 md:w-150">
    <div class="row-span-3 col-start-1 col-end-2 row-end-6
        flex items-center justify-center flex-col gap-2">
        <Player p={players[1]}/>
    </div>
    <div class="row-span-3 col-start-2 col-end-3 row-end-4
        flex items-center justify-center flex-col gap-2">
        <Player p={players[0]}/>
    </div>
    <div class="row-span-3 col-start-3 -col-end-1 row-end-7
        flex items-center justify-center flex-col gap-2">
        <Player p={players[2]}/>
    </div>
    <Podium class={["absolute bottom-0 left-0 -z-10", 
        "h-25 md:h-50 w-75 md:w-150"]}/>
    <Spotlight class="absolute -z-20 blur-xl
        bottom-0 -left-12.5 w-100 h-50
        md:-left-25 md:w-200 md:h-100"/>
    <Spotlight class="absolute -scale-x-100 -z-20 blur-xl
        bottom-0 -right-12.5 w-100 h-50
        md:-right-25 md:w-200 md:h-100"/>
</div>)