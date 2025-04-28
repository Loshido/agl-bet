import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import Logo from "~/assets/logo.png?jsx"
import { compare, hash } from "~/lib/argon";
import cookie from "~/lib/cookie";
import { sign } from "~/lib/jwt";
import pg from "~/lib/pg";

type Response = { pseudo: string, pass: string, actif: boolean }
export const useSubmit = routeAction$(async (form, ctx) => {
    const client = await pg();

    const response = await client.query<Response>(
        `SELECT pseudo, pass, actif FROM utilisateurs WHERE pseudo = $1`, 
        [form.pseudo]
    );
    
    if(!response.rowCount) {
        if(ctx.env.get('INSCRIPTION') === 'false') {
            client.release()
            return "Les inscriptions ne sont plus ouvertes."
        }
        const computed_pass = await hash(form.pass);
        const insertion = await client.query(
            `INSERT INTO utilisateurs (pseudo, pass) VALUES ($1, $2);`,
            [form.pseudo, computed_pass]
        );
        client.release()
        if(insertion.rowCount) {
            throw ctx.redirect(302, '/inactif')
        } else {
            return "Erreur stupéfiante 👀"
        }

    } else {
        client.release()
        if(await compare(form.pass, response.rows[0].pass) === false) 
            return "Erreur palpitante 👀"
        if(!response.rows[0].actif) throw ctx.redirect(302, '/inactif')
    }

    const jwt = await sign({ pseudo: form.pseudo }, ctx.env)
    if(!jwt) {
        console.error("[jwt] Erreur lors de la signature d'un JWT.")
        return "Erreur renversante 👀"
    }

    ctx.cookie.set('token', jwt, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 12),
        domain: cookie.domain,
        secure: cookie.secure,
    });
    throw ctx.redirect(302, '/home/match?delete-cache')
}, zod$({
    pseudo: z.string(),
    pass: z.string().min(4)
}))

export default component$(() => {
    const submit = useSubmit()

    return <section class="w-screen h-svh flex flex-col items-center justify-center gap-32">
        <Logo alt="logo" class="max-h-48 w-auto"/>

        <Form action={submit} class="flex flex-col gap-4 font-sobi *:outline-none">
            <input type="text" placeholder="Pseudo" name="pseudo"
                class="bg-white/25 placeholder:text-white/50 
                p-4 rounded-md text-xl" required={true} />
            <input type="password" placeholder="Mots de passe"
                class="bg-white/25 placeholder:text-white/50 
                p-4 rounded-md text-xl" name="pass" min={4}/>
            <input type="submit" value="Connexion / Inscription"
                class="bg-pink hover:bg-pink/75 text-white 
                p-4 rounded-md text-2xl cursor-pointer
                transition-colors" required={true} />

            <pre class="font-avenir font-light text-center">
                {
                    submit.submitted && typeof submit.value === 'string' 
                    && submit.value as string
                    ||
                    submit.submitted && submit.value?.failed 
                    && "Le mots de passe doit contenir au moins 4 caractères"
                }
            </pre>
        </Form>
    </section>
});

