import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import Affiche from "~/components/equipes/affiche";

import { matchs } from "~/lib/queries";
export const useMatch = routeLoader$(async () => {
    return await matchs()
})

export default component$(() => {
    const matchs = useMatch()


    return <>
        {
            matchs.value.map(match => <Affiche {...match} />)
        }
    </>
})