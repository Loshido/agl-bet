import { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ctx => {
    ctx.headers.set('Set-Cookie', 'token=deleted; path=/; expires=' +new Date(0).toUTCString())

    throw ctx.redirect(302, '/')
}