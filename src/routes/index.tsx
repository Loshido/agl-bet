import { $, component$, type Signal, useSignal } from "@builder.io/qwik";
import { RequestHandler, type RouteNavigate, server$, useNavigate } from "@builder.io/qwik-city";
import Connexion from "~/components/connexion";
import { compare, hash } from "~/lib/argon";
import cookie from "~/lib/cookie";
import { sign, verify } from "~/lib/jwt";
import pg from "~/lib/pg";

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
    if(pass.length < 4) return [400, "Mots de passe trop court!"]
    if(pseudo.length < 4) return [400, "Pseudo trop court!"]
    
    const client = await pg();
    
    const response = await client.query<Response>(
        `SELECT pseudo, pass, roles FROM utilisateurs WHERE pseudo = $1`, 
        [pseudo]
    );
    
    if(!response.rowCount) {
        // l'utilisateur n'existe pas
        const computed_pass = await hash(pass);
        const insertion = await client.query(
            `INSERT INTO utilisateurs (pseudo, pass, roles) VALUES ($1, $2, '[]');`,
            [pseudo, computed_pass]
        );
        client.release()

        const jwt = await sign({ pseudo, roles: [] }, this.env)
        if(!jwt) return [500, "Erreur renversante 👀"]

        this.cookie.set('token', jwt, {
            expires: new Date(Date.now() + 1000 * 60 * 30),
            domain: cookie.domain,
            secure: cookie.secure,
            path: cookie.path
        });

        return insertion.rowCount 
            ? [401, "Compte en attente"] 
            : [400, "Erreur stupéfiante 👀"]
    }
    client.release()

    if(await compare(pass, response.rows[0].pass) === false) 
        return [400, "Erreur palpitante 👀"]

    const roles = response.rows[0].roles
    const jwt = await sign({ pseudo, roles }, this.env)
    if(!jwt) return [500, "Erreur renversante 👀"]

    const duration = roles.includes('user') ? 1000 * 60 * 60 * 12 : 1000 * 60 * 30
    this.cookie.set('token', jwt, {
        expires: new Date(Date.now() + duration),
        domain: cookie.domain,
        secure: cookie.secure,
        path: cookie.path
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

    return <Connexion
        message={message}
        onSubmit={onSubmit(message, nav)}/>
});

