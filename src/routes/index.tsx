import { component$, useSignal } from "@builder.io/qwik";
import { type RequestHandler, useNavigate } from "@builder.io/qwik-city";
import Logo from "~/assets/logo.png?jsx"
import { compare, hash } from "~/lib/argon";
import cookie from "~/lib/cookie";
import { sign } from "~/lib/jwt";
import pg from "~/lib/pg";

type Response = { pseudo: string, pass: string, actif: boolean }
export const onPost: RequestHandler = async ctx => {
    const form = await ctx.parseBody()
    if(typeof form !== 'object' || 
        !form || 
        !('pseudo' in form && 'pass' in form) ||
        typeof form.pseudo != 'string' ||
        typeof form.pass != 'string') {
        ctx.send(400, 'Mauvaises entrées')
        return
    }

    if(form.pass.length < 4) {
        ctx.send(400, 'Mots de passe trop court!')
        return
    }
    if(form.pseudo.length < 4) {
        ctx.send(400, 'Pseudo trop court!')
        return
    }
    
    const client = await pg();

    const response = await client.query<Response>(
        `SELECT pseudo, pass, actif FROM utilisateurs WHERE pseudo = $1`, 
        [form.pseudo]
    );
    
    if(!response.rowCount) {
        if(ctx.env.get('INSCRIPTION') === 'false') {
            client.release()
            ctx.send(400, "Les inscriptions ne sont plus ouvertes.")
            return
        }
        const computed_pass = await hash(form.pass);
        const insertion = await client.query(
            `INSERT INTO utilisateurs (pseudo, pass) VALUES ($1, $2);`,
            [form.pseudo, computed_pass]
        );
        client.release()

        if(insertion.rowCount) {
            ctx.send(401, 'Compte en attente')
        } else {
            ctx.send(400, "Erreur stupéfiante 👀")
        }
        return
    } else {
        client.release()
        if(!response.rows[0].actif) {
            ctx.send(401, 'Compte en attente')
            return
        }
        if(await compare(form.pass, response.rows[0].pass) === false) {
            ctx.send(400, "Erreur palpitante 👀")
            return 
        }
    }

    const jwt = await sign({ pseudo: form.pseudo }, ctx.env)
    if(!jwt) {
        console.error("[jwt] Erreur lors de la signature d'un JWT.")
        ctx.send(400, "Erreur renversante 👀")
        return
    }

    ctx.cookie.set('token', jwt, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 12),
        domain: cookie.domain,
        secure: cookie.secure,
    });
    ctx.send(200, 'ok')
}

export default component$(() => {
    const message = useSignal('')
    const nav = useNavigate()

    return <section class="w-screen h-svh flex flex-col items-center justify-center gap-32">
        <Logo loading="lazy" decoding="async" fetchPriority="low"
            alt="logo" class="max-h-48 w-auto"/>

        <div class="flex flex-col gap-4 font-sobi *:outline-none">
            <input type="text" placeholder="Pseudo" name="pseudo"
                class="bg-white/25 placeholder:text-white/50 
                p-4 rounded-md text-xl" required={true} />
            <input type="password" placeholder="Mots de passe"
                class="bg-white/25 placeholder:text-white/50 
                p-4 rounded-md text-xl" name="pass" min={4} required={true}/>
            <input type="submit" value="Connexion / Inscription"
                class="bg-pink hover:bg-pink/75 text-white 
                p-4 rounded-md text-2xl cursor-pointer
                transition-colors" required={true}
                onClick$={async () => {
                    const pseudo = document.querySelector('input[name="pseudo"]') as HTMLInputElement
                    const pass = document.querySelector('input[name="pass"]') as HTMLInputElement
                    if(pseudo.value.length <= 3 || pass.value.length <= 3) {
                        message.value = 'Veuillez remplir les entrées'
                        return
                    }
                    
                    const response = await fetch('/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pseudo: pseudo.value,
                            pass: pass.value
                        })
                    })
                    switch(response.status) {
                        case 200:
                            await nav('/home/match?delete-cache')
                            return
                        case 401:
                            await nav('/inactif')
                            return
                        default:
                            const msg = await response.text()
                            message.value = msg
                            break
                    }
                }} />

            <pre class="font-avenir font-light text-center">
                { message.value }
            </pre>
        </div>
    </section>
});

