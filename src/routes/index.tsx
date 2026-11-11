import { $, component$, type Signal, useSignal } from "@builder.io/qwik";
import { RequestHandler, type RouteNavigate, server$, useNavigate } from "@builder.io/qwik-city";
import BDS from "~/assets/bds.png?jsx"
import Fond from "~/assets/fond.svg?jsx"
import IE from "~/assets/ie.png?jsx"
import { compare, hash } from "~/lib/argon";
import cookie from "~/lib/cookie";
import { sign, verify } from "~/lib/jwt";
import pg from "~/lib/pg";
import kv from "~/lib/kv"

export const onGet: RequestHandler = async ctx => {
    const token = ctx.cookie.get('token')
    const payload = token ? await verify(token.value, ctx.env) : null
    if(payload) {
        if(payload.roles.includes('admin'))
            throw ctx.redirect(302, '/admin')
        if(payload.roles.includes('user'))
            throw ctx.redirect(302, '/home');
        throw ctx.redirect(302, '/inactif')
    }
}

type Response = { pseudo: string, pass: string, roles: string[] }
const submit = server$(async function(pseudo: string, pass: string): Promise<[number, string]> {
    pseudo = pseudo.toLowerCase().trim() // practicité
    if(pass.length < 4) return [400, "Mots de passe trop court!"]
    if(pseudo.length < 4) return [400, "Pseudo trop court!"]

    const client = await pg();

    const response = await client.query<Response>(
        `SELECT pseudo, pass, roles FROM utilisateurs WHERE pseudo = $1`,
        [pseudo]
    );

    if(!response.rowCount) {
        if(kv.get('inscriptions') !== '1') {
                return [501, 'Les inscriptions ne sont plus ouvertes.']
        }

        // l'utilisateur n'existe pas
        let agl = 10000
        {
            const default_agl_str = this.env.get('DEFAULT_AGL')
            const default_agl = default_agl_str ? parseInt(default_agl_str) : -1

            if(default_agl >= 0) agl = default_agl
        }
        const computed_pass = await hash(pass);
        const insertion = await client.query(
            `INSERT INTO utilisateurs (pseudo, pass, roles, agl) VALUES ($1, $2, '[]', $3);`,
            [pseudo, computed_pass, agl]
        );

        const jwt = await sign({ pseudo, roles: [] }, this.env)
        if(!jwt) return [500, "Erreur renversante 👀"]

        this.cookie.set('token', jwt, {
            expires: new Date(Date.now() + 1000 * 60 * 30),
            ...cookie
        });

        return insertion.rowCount
            ? [401, "Compte en attente"]
            : [400, "Erreur stupéfiante 👀"]
    }

    if(await compare(pass, response.rows[0].pass) === false)
        return [400, "Erreur palpitante 👀"]

    const roles = response.rows[0].roles
    const jwt = await sign({ pseudo, roles }, this.env)
    if(!jwt) return [500, "Erreur renversante 👀"]

    const duration = roles.includes('user') ? 1000 * 60 * 60 * 12 : 1000 * 60 * 30
    this.cookie.set('token', jwt, {
        expires: new Date(Date.now() + duration),
        ...cookie
    });

    return roles.includes('user') ? [200, 'ok'] : [401, 'Compte en attente']
})

const onSubmit = (message: Signal<string>, nav: RouteNavigate) => {
    return $(async () => {
        const pseudo = document.querySelector('input[name="pseudo"]') as HTMLInputElement
        const pass = document.querySelector('input[name="pass"]') as HTMLInputElement
        if(pseudo.value.length < 4 || pass.value.length < 4) {
            message.value = 'Veuillez remplir les entrées'
            return
        }

        const [code, reponse] = await submit(pseudo.value, pass.value)
        switch(code) {
            case 200:
                await nav('/home/')
                return
            case 401:
                await nav('/inactif')
                return
            default:
                message.value = reponse
                break
        }
    })
}

export default component$(() => {
    const message = useSignal('')
    const nav = useNavigate()

	return <section
		class="w-screen h-svh flex flex-col items-center justify-center gap-8">
		<div class="-z-10 *:absolute *:top-0 *:left-0 *:w-full *:h-full animate-pulse
            md:opacity-25">
			<Fond/>
		</div>
		<div class="flex flex-row items-center gap-4">
			<div class="w-24 h-24 p-2">
				<BDS />
			</div>
			<span class="italic uppercase">x</span>
			<div class="w-24 h-24 p-2">
				<IE />
			</div>
		</div>
		<h1 class="font-black text-3xl md:text-4xl uppercase font-sobi">
			Soirée FIFA
		</h1>
		<div class="flex flex-col gap-4 *:outline-none font-semibold pb-32">
			<input type="text" placeholder="Pseudo" name="pseudo" required={true}
				class="p-4 rounded-lg text-xl leading-0
                bg-midnight/25 placeholder:text-white/75 backdrop-blur-sm"/>
			<input type="password" placeholder="Mots de passe"
				name="pass" min={4} required={true} onKeyDown$={e => {
					if (e.key === "Enter") onSubmit(message, nav)()
				}}
				class="p-4 rounded-lg text-xl leading-0
                bg-midnight/25 placeholder:text-white/75 backdrop-blur-sm" />
			<input type="submit" value="Connexion / Inscription"
				class="bg-pink hover:bg-pink/50 text-white backdrop-blur-sm
                py-4 px-5 rounded-md text-xl cursor-pointer font-sobi
                transition-colors" required={true}
				onClick$={onSubmit(message, nav)} />
			<pre class="font-avenir font-light text-center">
				{message.value}
			</pre>
		</div>
	</section>
});
