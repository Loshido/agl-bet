
import { createQwikCity } from "@builder.io/qwik-city/middleware/bun";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";

const { router, notFound, staticFile } = createQwikCity({
    render,
    qwikCityPlan,
    manifest,
});

const port = Number(Bun.env.PORT ?? 80);

console.log(`[runtime] server started at http://localhost:${port}/`);

const server = Bun.serve({
    reusePort: true,
    async fetch(request: Request) {
        const staticResponse = await staticFile(request);
        if (staticResponse) {
            return staticResponse;
        }

        const qwikCityResponse = await router(request);
        if (qwikCityResponse) {
            return qwikCityResponse;
        }

        return notFound(request);
    },
    port,
});

process.addListener('SIGTERM', async () => await server.stop())