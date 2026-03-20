import { type RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";
import { verify } from "~/lib/jwt";

export const onRequest: RequestHandler = async ctx => {
    const token = ctx.cookie.get('token')?.value
    const payload = token ? await verify(token, ctx.env) : null
    if(!payload || !payload.roles.includes('admin')) throw ctx.redirect(302, '/')

    ctx.sharedMap.set('payload', payload)
}