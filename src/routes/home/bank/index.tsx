import { component$, useContext } from "@builder.io/qwik";

import { MetaContext } from "../layout";
import Menu from "~/components/home/bank/menu";
export default component$(() => {    
    const meta = useContext(MetaContext)
    return <Menu agl={meta.agl} />
})