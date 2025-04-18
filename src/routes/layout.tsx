import { component$, Slot } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { verify } from "~/lib/jwt";

export const onGet: RequestHandler = async ({ cacheControl }) => {
    // Control caching for this request for best performance and to reduce hosting costs:
    // https://qwik.dev/docs/caching/
    cacheControl({
        // Always serve a cached response by default, up to a week stale
        staleWhileRevalidate: 60 * 60 * 24 * 7,
        // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
        maxAge: 5,
    });
};

export const onRequest: RequestHandler = async ctx => {
    const token = ctx.cookie.get('token')
    if(!ctx.url.pathname.startsWith('/home') && token) {
        const payload = await verify(token.value, ctx.env)
        if(payload) throw ctx.redirect(302, '/home')
    }
}

export default component$(() => {
    return <Slot />;
});

export const head: DocumentHead = {
    title: "AGL Bet",
    meta: [
        {
            name: "description",
            content: "Une plateforme de paris fictifs pour l'évènement All Game Long",
        },
    ],
};