import { component$, createContextId, Slot, useContextProvider, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, server$, useDocumentHead, useLocation } from "@builder.io/qwik-city";
import { sign, verify } from "~/lib/jwt";
import pg from "~/lib/pg";

export const onRequest: RequestHandler = async ctx => {
    const token = ctx.cookie.get('token')?.value
    const payload = token ? await verify(token, ctx.env) : null
    if(!payload || !payload.roles.includes('user')) throw ctx.redirect(302, '/')
        
    ctx.sharedMap.set('payload', payload)
}
    
export interface Meta {
    agl: number,
    roles: string[]
}

export const getMeta = server$(async function() {
    const token = this.cookie.get('token')?.value;
    const payload = token ? await verify(token, this.env) : null 
    if(!payload) return null

    const client = await pg()
    const response = await client.query<{ agl: number, roles: string[] }>(
        `SELECT agl, roles FROM utilisateurs WHERE pseudo = $1`,
        [payload.pseudo]
    )
    
    client.release()
    if(response.rowCount === 0) return null

    const user = response.rows[0]

    const sameLength = user.roles.length !== payload.roles.length
    const match = user.roles.every(role => payload.roles.includes(role))
    if(!sameLength || !match) {
        const jwt = await sign({ roles: user.roles, pseudo: payload.pseudo }, this.env) 
        if(jwt) this.cookie.set('token', jwt, cookie) 
    }

    return response.rows[0]
})

import cookie from "~/lib/cookie";
import HomeLayout from "~/components/home/home-layout";
import ClientStore from "~/lib/storage";

export const MetaContext = createContextId<Meta>('meta')

export default component$(() => {
    const head = useDocumentHead();
    const loc = useLocation();
    const meta = useStore<Meta>({
        agl: 0,
        roles: []
    })
    useContextProvider(MetaContext, meta)

    useVisibleTask$(async () => {
        const store = new ClientStore<Meta>('meta')
        const fresh = await store.get(async () => {
            const data = await getMeta()
            if(data) return data
            return { agl: 0, roles: [] }
        })

        meta.agl = fresh.agl;
        meta.roles = fresh.roles
    })

    if(head.frontmatter.home_layout === false) return <Slot/>
    return <HomeLayout location={loc} agl={meta.agl} roles={meta.roles} />
})