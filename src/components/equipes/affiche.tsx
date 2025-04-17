import { component$ } from "@builder.io/qwik";
import Equipe from "./equipe";
import Users from "~/assets/users.svg?jsx"
import { Link } from "@builder.io/qwik-city";

type Props = {
    id: string,
    titre: string,
    description: string,

    equipes: {
        nom: string,
        img?: string
    }[]

    participants: number,
    agl: number
}
export default component$((affiche: Props) => {
    return <div class="w-full flex flex-col gap-1 bg-white/25 p-4 rounded-md relative">
        <h2 class="font-sobi text-2xl">
            { affiche.titre }
        </h2>
        <p class="text-white/75 text-wrap">
            { affiche.description }
        </p>
        <div class="flex flex-row items-center justify-center py-4 overflow-x-auto">
            {
                affiche.equipes.map((equipe, i, a) => <>
                    <Equipe class="py-2"
                        {...equipe}/>
                    {
                        i + 1 !== a.length && <span class="font-sobi text-pink">
                            VS
                        </span>
                    }
                </>)
            }
        </div>
        <div class="flex flex-row items-center gap-2">
            <Users class="h-3 w-3"/>
            <p class="font-sobi text-lg">
                { affiche.participants }
            </p>

            <div class="h-5 w-0.5 mx-2 rounded-md bg-white/25"/>

            <p class="font-sobi text-lg">
                { affiche.agl }
                <span class="text-pink text-sm mx-1">
                    agl
                </span>
            </p>
        </div>
        <Link href={`/match/${affiche.id}`}
            class="absolute bottom-4 right-4 px-3 py-1.5 bg-pink rounded-md font-sobi">
            Parier
        </Link>
    </div>
})