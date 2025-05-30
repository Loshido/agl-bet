import type { RequestHandler } from "@builder.io/qwik-city";
import cookie from "~/lib/cookie";

import { tokens } from "~/routes/admin/auth";
export const onGet: RequestHandler = async ctx => {
    const token = ctx.params.token;
    const exists = tokens.has(token)
    if(!exists) {
        ctx.send(404, "Not found")
        return
    }

    const meta = tokens.get(token)!
    if(meta.claimed) {
        if(ctx.cookie.has('admin')) {
            throw ctx.redirect(302, '/admin')
        } else {
            ctx.send(409, "Token already claimed");
        }
        return
    }

    ctx.cookie.set('admin', token, {
        path: '/admin/',
        domain: cookie.domain,
        secure: cookie.secure,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12)
    })
    console.info(`[admin] ${meta.name} a réclamé son jeton.`)
    tokens.set(token, {
        ...meta,
        claimed: true
    })
    throw ctx.redirect(302, '/admin')
}