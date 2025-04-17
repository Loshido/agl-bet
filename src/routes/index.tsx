import { component$ } from "@builder.io/qwik";
import { Form, type DocumentHead } from "@builder.io/qwik-city";
import Logo from "~/assets/logo.png?jsx"

export default component$(() => {
    return <section class="w-screen h-svh flex flex-col items-center justify-center gap-32">
        <Logo alt="logo" class="max-h-48 w-auto"/>

        <Form class="flex flex-col gap-4 font-sobi *:outline-none">
            <input type="text" placeholder="Pseudo"
                class="bg-white/25 placeholder:text-white/50 
                p-4 rounded-md text-xl" />
            <input type="password" placeholder="Mots de passe"
                class="bg-white/25 placeholder:text-white/50 
                p-4 rounded-md text-xl"/>
            <input type="submit" value="Connexion / Inscription"
                class="bg-pink hover:bg-pink/75 text-white 
                p-4 rounded-md text-2xl cursor-pointer
                transition-colors"/>
        </Form>
    </section>
});

export const head: DocumentHead = {
    title: "AGL Bet",
    meta: [
        {
            name: "description",
            content: "Une plateforme de paris fictifs pour l'évènement All Game Long",
        },
    ],
};
