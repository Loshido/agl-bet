import { component$, type Signal, useSignal } from "@builder.io/qwik";
import { RequestHandler, type RouteNavigate, server$, useNavigate } from "@builder.io/qwik-city";
import Connexion from "~/components/connexion";
import { compare, hash } from "~/lib/argon";
import cookie from "~/lib/cookie";
import { sign, verify } from "~/lib/jwt";
import pg from "~/lib/pg";

export const onGet: RequestHandler = async ctx => {
    const token = ctx.cookie.get('token')
    if(token) {
        const payload = await verify(token.value, ctx.env)
        if(payload) throw ctx.redirect(302, '/home')
    }
}

type Response = { pseudo: string, pass: string, actif: boolean }
const submit = server$(async function(pseudo: string, pass: string): Promise<[number, string]> {
    if(pass.length < 4) return [400, "Mots de passe trop court!"]
    if(pseudo.length < 4) return [400, "Pseudo trop court!"]
    
    const client = await pg();

    const response = await client.query<Response>(
        `SELECT pseudo, pass, actif FROM utilisateurs WHERE pseudo = $1`, 
        [pseudo]
    );
    
    if(!response.rowCount) {
        if(this.env.get('INSCRIPTION') === 'false') {
            client.release()
            return [400, "Les inscriptions ne sont plus ouvertes."]
        }
        const computed_pass = await hash(pass);
        const insertion = await client.query(
            `INSERT INTO utilisateurs (pseudo, pass) VALUES ($1, $2);`,
            [pseudo, computed_pass]
        );
        client.release()

        return insertion.rowCount 
            ? [401, "Compte en attente"] 
            : [400, "Erreur stupéfiante 👀"]
    } else {
        client.release()
        if(!response.rows[0].actif) return [401, 'Compte en attente']
        if(await compare(pass, response.rows[0].pass) === false) 
            return [400, "Erreur palpitante 👀"]
    }

    const jwt = await sign({ pseudo: pseudo }, this.env)
    if(!jwt) {
        console.error("[jwt] Erreur lors de la signature d'un JWT.")
        return [500, "Erreur renversante 👀"]
    }

    this.cookie.set('token', jwt, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 12),
        domain: cookie.domain,
        secure: cookie.secure,
    });

    return [200, 'ok']
})

const onSubmit = (message: Signal<string>, nav: RouteNavigate) => {
    return async () => {
        const pseudo = document.querySelector('input[name="pseudo"]') as HTMLInputElement
        const pass = document.querySelector('input[name="pass"]') as HTMLInputElement
        if(pseudo.value.length < 4 || pass.value.length < 4) {
            message.value = 'Veuillez remplir les entrées'
            return
        }
        
        const [code, reponse] = await submit(pseudo.value, pass.value)
        switch(code) {
            case 200:
                await nav('/home/match?delete-cache')
                return
            case 401:
                await nav('/inactif')
                return
            default:
                message.value = reponse
                break
        }
    }
}

export default component$(() => {
    const message = useSignal('')
    const nav = useNavigate()

    return <Connexion
        message={message.value}
        onSubmit={onSubmit(message, nav)}/>
});

