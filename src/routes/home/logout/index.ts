import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ctx => {
    ctx.cookie.delete('token', {
        path: '/'
    })
    ctx.cookie.delete('transactions', {
        path: '/home/bank/history'
    })
    // ctx.headers.append('Set-Cookie', 'token=deleted; path=/; expires=' + new Date(0).toUTCString())
    // ctx.headers.append('Set-Cookie', 'transactions=deleted; path=/home/bank/history; expires=' + new Date(0).toUTCString())

    throw ctx.redirect(302, '/')
}