import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, RequestHandler, server$, useNavigate } from "@builder.io/qwik-city";
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
        sameSite: 'strict',
        secure: cookie.secure,
        path: cookie.path
    });

    return 200
})

export const onPost: RequestHandler = async ({ env, ...ev }) => {
    const token = ev.cookie.get('token')?.value
    const payload = token ? await verify(token, env) : null
    if(!payload) {
        ev.cookie.delete('token', cookie)
        ev.text(404, "Not connected")
        return 
    }

    const client = await pg();
    const response = await client.query<Response>(
        `SELECT pseudo, roles FROM utilisateurs WHERE pseudo = $1`, 
        [payload.pseudo]
    );
    client.release()
        
    if(!response.rowCount) {
        ev.cookie.delete('token', cookie)
        ev.text(404, "Unauthentificated")
        return
    }
    if(!response.rows[0].roles.includes('user')) {
        ev.text(400, "Not accepted")
        return
    }
    
    const jwt = await sign({ ...payload }, env)
    if(!jwt) {
        ev.text(500, "JWT couldn't be signed")
        return
    }
    
    ev.cookie.set('token', jwt, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 12),
        domain: cookie.domain,
        sameSite: 'strict',
        secure: cookie.secure,
        path: cookie.path
    });

    ev.text(200, 'ok')
};

export default component$(() => {
    const status = useSignal(0)
    useVisibleTask$(async () => {
        const response = await fetch('/inactif/', {
            method: 'POST',
            credentials: 'include'
        })

        status.value = response.status
        if(status.value !== 200 && status.value !== 404) 
            setInterval(location.reload, 5000)
    })

    return <section class="h-screen w-screen flex flex-col gap-4 items-center justify-center">
        {
            status.value !== 200 && status.value !== 404 && <>
                <h2 class="font-sobi text-2xl relative max-w-4/5 text-center">
                    Ton profil est en cours de validation ⌛️
                </h2>
                <p>
                    Essaye de te faire répérer par les organisateurs
                </p>
                <Link prefetch={false} class="text-pink hover:text-pink/75 
                    font-medium transition-colors" 
                    href="/deconnexion">Déconnexion</Link>
            </>
        }
        {
            status.value === 200 && <>
                <h2 class="font-sobi text-2xl relative max-w-4/5 text-center">
                    Ton profil est validé 🥳
                </h2>
                <Link prefetch={false} class="text-pink hover:text-pink/75 
                    font-medium transition-colors" 
                    href="/home">
                    Accès à la plateforme
                </Link>
            </>
        }
        {
            status.value === 404 && <>
                <h2 class="font-sobi text-2xl relative max-w-4/5 text-center">
                    Votre compte n'existe pas
                </h2>
                <Link prefetch={false} class="text-pink hover:text-pink/75 
                    font-medium transition-colors" 
                    href="/">
                    Connexion / Inscription
                </Link>
            </>
        }
    </section>
})