import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { Link, server$, useNavigate } from "@builder.io/qwik-city";
import cookie from "~/lib/cookie";
import { sign, verify } from "~/lib/jwt";
import pg from "~/lib/pg"

type Response = { pseudo: string, roles: string[] }
export const checkStatus = server$(async function() {
    const token = this.cookie.get('token')?.value
    const payload = token ? await verify(token, this.env) : null
    if(!payload) {
        this.cookie.delete('token', cookie)
        return 404
    }

    const client = await pg();
    const response = await client.query<Response>(
        `SELECT pseudo, roles FROM utilisateurs WHERE pseudo = $1`, 
        [payload.pseudo]
    );
    client.release()
        
    if(!response.rowCount) {
        this.cookie.delete('token', cookie)
        return 404
    }
    if(!response.rows[0].roles.includes('user')) return 400
    
    const jwt = await sign({ ...payload }, this.env)
    if(!jwt) return 500
    
    this.cookie.set('token', jwt, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 12),
        domain: cookie.domain,
        secure: cookie.secure,
    });

    return 200
})

export default component$(() => {
    const nav = useNavigate()
    useVisibleTask$(async () => {
        const status = await checkStatus()

        switch(status) {
            case 200:
                nav('/home')
                break;
            case 404:
                nav('/')
                break;
            default:
                setInterval(location.reload, 5000)
                break;
        }
    })

    return <section class="h-screen w-screen flex flex-col gap-4 items-center justify-center">
        <h2 class="font-sobi text-2xl relative max-w-4/5 text-center">
            Ton profil est en cours de validation ⌛️
        </h2>
        <p>
            Essaye de te faire répérer par les organisateurs
        </p>
        <Link prefetch={false} class="text-pink hover:text-pink/75 
            font-medium transition-colors" 
            href="/deconnexion">Déconnexion</Link>
    </section>
})