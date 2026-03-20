import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate, type RequestHandler } from "@builder.io/qwik-city";
import cookie from "~/lib/cookie";

export const onGet: RequestHandler = async ctx => {
    ctx.cookie.delete('token', cookie)
}

export default component$(() => {
    const nav = useNavigate()

    useVisibleTask$(() => {
        setTimeout(() => {
            localStorage.removeItem('meta')
            localStorage.removeItem('transactions')
            nav('/')
        }, 100)
    })

    return <div>
        dacc
    </div>
})