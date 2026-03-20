import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { type RequestHandler, routeLoader$, useDocumentHead, useLocation } from "@builder.io/qwik-city";

export interface SharedPayload {
    pseudo: string,
    agl: number,
    credit?: 'remboursement' | 'en attente'
}

import { verify } from "~/lib/jwt";
import pg from "~/lib/pg";

export const onGet: RequestHandler = async ctx => {
    if(ctx.url.searchParams.has('delete-cache')) {
        ctx.cookie.delete('transactions', {
            domain: cookie.domain,
        })
    }

    const token = ctx.cookie.get('token');
    if(!token) throw ctx.redirect(302, '/');
    
    const payload = await verify(token.value, ctx.env)
    if(!payload) throw ctx.redirect(302, '/')
    

    const client = await pg()
    const response = await client.query<{ agl: number }>(
        `SELECT agl FROM utilisateurs WHERE pseudo = $1`,
        [payload.pseudo]
    )
    const credits = await client.query<{ status: 'remboursement' | 'en attente' | 'rembourse'}>(
        `SELECT status FROM credits WHERE pseudo = $1`, 
        [payload.pseudo])
    client.release()
    const credit = credits.rowCount && credits.rows.some(row => row.status !== 'rembourse')
        ? credits.rows.find(row => row.status !== 'rembourse')!.status as 'remboursement' | 'en attente'
        : undefined

    ctx.sharedMap.set('payload', {
        pseudo: payload.pseudo,
        agl: response.rows[0].agl,
        credit
    })
}

import cookie from "~/lib/cookie";
import HomeLayout from "~/components/home-layout";

export const usePayload = routeLoader$(ctx => {
    return ctx.sharedMap.get('payload') as SharedPayload
})

export default component$(() => {
    const head = useDocumentHead();
    const loc = useLocation();
    const payload = usePayload()

    useVisibleTask$(() => {
        if(loc.url.searchParams.has('delete-cache')) {
            localStorage.clear()
            sessionStorage.clear()

            loc.url.searchParams.delete('delete-cache')
        }
    })

    if(head.frontmatter.home_layout === false) return <Slot/>
    return <HomeLayout location={loc} agl={payload.value.agl} />
})